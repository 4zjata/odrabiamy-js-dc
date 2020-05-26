const Discord = require("discord.js");
const bot = new Discord.Client();
const json = require("./klucz.json");
const odrabiamy = require("../odrabiamy-pl.js");
const {error} = require("jquery");

bot.on("ready", () => {
	console.log(`Logged in as ${bot.user.username}!`);
});

module.exports.Init = function () {
	bot.login(json.token);
};

userdata = {};
favdata = {};
userdata_prev = {};
messages = {};

bot.on("message", async function (msg) {
	if (msg.content.startsWith("!")) {
		if (msg.author.bot) return;
		console.log(`DCBOT VALID CMD: ${msg}`);
		let wiad = msg.content.slice(1).trim();
		let args = wiad.split(/[ ]+/);
		let cmd = args.shift();
		if (cmd.toLowerCase() === "odrabiamy" || cmd.toLowerCase() === "o") {
			console.log("got !odrabiamy");
			let przedmioty = Object.keys(odrabiamy.getALLBooks()).sort();
			let przedmioty_arr = {};
			let przedmioty_arrsend = [];
			przedmioty.forEach((element) => {
				if (
					!przedmioty_arr[element.split(" ").slice(1, 1024).join(" ")]
				)
					przedmioty_arr[
						element.split(" ").slice(1, 1024).join(" ")
					] = [];
				przedmioty_arr[
					element.split(" ").slice(1, 1024).join(" ")
				].push(element.split(" ").slice(0, 1).join(" "));
			});
			Object.keys(przedmioty_arr).forEach((el) => {
				przedmioty_arr[el].forEach((el2) => {
					przedmioty_arrsend.push(`${el2} ${el}`);
				});
			});
			ClearChoosen(msg);
			AddChooseState(przedmioty_arrsend, "", msg);
			SendBotMsgINCodeBlock(
				`!odrabiamy <@${
					msg.author.id
				}> \nWybierz Klase:  \`\`\`st\n${przedmioty_arrsend.join(
					"\n"
				)} \`\`\`\n!c[hoose] <nazwa>`,
				msg,
				"```st\n",
				"```\n"
			);
		} else if (
			cmd.toLowerCase() === "choose" ||
			cmd.toLowerCase() === "c"
		) {
			
			if (
				userdata[msg.author.id] &&
				userdata[msg.author.id] != "none" &&
				userdata[msg.author.id] != ""
			) {
				args = args.join(" ");
				args = args.split(/[ ]+[|][ ]+/);
				let min = Math.ceil(0);
				let max = Math.floor(args.length);
				let choosen = args[
					Math.floor(Math.random() * (max - min) + min)
				].trim();
				if (CheckChoosen(choosen, msg)) {
					//sprawdz jezeli autor wiadomosci zainicjowal wczesniej !o
					
					if (userdata[msg.author.id][0] == 0) {
						//sprawdz czy uzytkownik jest swiezo po wpisaniu !o i wybiera klase
						let subj = Object.keys(
							odrabiamy.Ksiazki_Subjects[choosen]
						);
						let subj2 = Object.keys(
							odrabiamy.Ksiazki_Subjects[choosen]
						);
						subj.forEach((element, i) => {
							subj[i] = element;
							subj2[i] = "+ " + element;
						});
						AddChooseState(subj, choosen, msg);
						SendBotMsg(`<@${msg.author.id}>`, msg);
						SendBotMsg(`Wybrano \`${choosen}\``, msg);
						SendBotMsgINCodeBlock(
							`Wybierz Przedmiot:  \`\`\`diff\n${subj2.join(
								"\n"
							)} \`\`\`\n!c[hoose] <nazwa>`,
							msg,
							"```diff\n",
							"```\n"
						);
					} else if (userdata[msg.author.id][0] == 1) {
						//sprawdz czy uzytkownik wybiera przedmiot
						books = odrabiamy.getBooksBySubject(
							userdata_prev[msg.author.id][1],
							choosen
						);
						books_arr = [];
						indexes = [];
						books.forEach((el, i) => {
							books_arr.push(`+ ${i} : ` + el.friendly_name);
							indexes.push(i);
						});
						AddChooseState(indexes, choosen, msg);
						SendBotMsg(`<@${msg.author.id}>`, msg);
						SendBotMsg(`Wybrano \`${choosen}\``, msg);
						SendBotMsgINCodeBlock(
							`Wybierz Ksiazke:  \`\`\`diff\n${books_arr.join(
								"\n"
							)} \`\`\`\n!c[hoose] <nazwa> (use ID)`,
							msg,
							"```diff\n",
							"```\n"
						);
					}
				} else if (userdata[msg.author.id][0] == 2) {
					//sprawdz czy uzytkownik wybiera ksiazke
					books = odrabiamy.getBooksBySubject(
						userdata_prev[msg.author.id][1],
						userdata_prev[msg.author.id][2]
					);
					book = books[choosen];
					AddChooseState(book.pages, choosen, msg);
					SendBotMsg(`<@${msg.author.id}>`, msg);
					SendBotMsg(`Wybrano \`${choosen}\``, msg);
					SendBotMsgINCodeBlock(
						`Wybierz Strone:  \`\`\`diff\n${book.pages.join(
							" "
						)} \`\`\`\n!c[hoose] <nazwa>`,
						msg,
						"```diff\n",
						"```\n"
					);
				} else if (userdata[msg.author.id][0] == 3) {
					//sprawdz czy uzytkownik wybiera strone
					books = odrabiamy.getBooksBySubject(
						userdata_prev[msg.author.id][1],
						userdata_prev[msg.author.id][2]
					);
					book = books[userdata_prev[msg.author.id][3]];
					exs = odrabiamy.getExList(book, choosen);
					towritearr = [];
					indexes = [];
					exs.forEach((el, i) => {
						towritearr.push(`+ ${i} : ` + el.number);
						indexes.push(i);
					});
					AddChooseState(indexes, choosen, msg);
					SendBotMsg(`<@${msg.author.id}>`, msg);
					SendBotMsg(`Wybrano \`${choosen}\``, msg);
					SendBotMsgINCodeBlock(
						`Wybierz Zadanie:  \`\`\`diff\n${towritearr.join(
							"\n"
						)} \`\`\`\n!c[hoose] <nazwa>`,
						msg,
						"```diff\n",
						"```\n"
					);
				}else if (userdata[msg.author.id][0] == 4) {
					//wyslij zadanie
					books = odrabiamy.getBooksBySubject(
						userdata_prev[msg.author.id][1],
						userdata_prev[msg.author.id][2]
					);
					book = books[userdata_prev[msg.author.id][3]];
					exs = odrabiamy.getExList(book, userdata_prev[msg.author.id][4]);
					ex = exs[choosen];
					SendBotMsg(`<@${msg.author.id}>`, msg);
					SendBotMsg(`Wybrano \`${choosen}\`\nPoczekaj na rozwiazanie`, msg);
					odrabiamy.GetExercise(exs,choosen).then(base64=>{
						
						require("fs").writeFileSync("tmp.html",base64,'utf8');
						SendBotMsg(`<@${msg.author.id}>`, msg);
						msg.channel.send(`ZADANIE:`, {
							files: ["./tmp.html"] 
						});
					});
					
				} else {
					SendBotMsg(
						`ERROR 404. Co ty wpisales? \`${choosen}\``,
						msg
					);
				}
			} else {
				SendBotMsg(`EJ EJ EJ. Czy ty wpisales \`!o[drabiamy]\`?`, msg);
			}
			//args[Math.floor(Math.random() * (min - max) + min)]
		} else if (cmd.toLowerCase() === "back" || cmd.toLowerCase() === "b") {
			BackChoosen(msg);
			SendBotMsg(`BACKED`, msg);
		} else if (cmd.toLowerCase() === "url") {
			args = args.join(" ");
				args = args.split(/[ ]+[|][ ]+/);
				let min = Math.ceil(0);
				let max = Math.floor(args.length);
				let choosen = args[
					Math.floor(Math.random() * (max - min) + min)
				].trim();

			SendBotMsg(`<@${msg.author.id}>`, msg);
			SendBotMsg(`Wybrano \`${choosen}\`\nPoczekaj na rozwiazanie`, msg);
			odrabiamy.GetEX(choosen).then(base64=>{
				
				require("fs").writeFileSync("tmp.html",base64,'utf8');
				SendBotMsg(`<@${msg.author.id}>`, msg);
				msg.channel.send(`ZADANIE:`, {
					files: ["./tmp.html"] 
				});
			});
		}
		//else if() wsparcie dla innych komend
		else {
			SendBotMsg(
				"Niepoprawna komenda, wspierane polecenia:\n- `!Odrabiamy [grade] [subject] [page] [example]`\n- `//TODO: !Odrabiamy list [grade]/[subject]`\n - `!Choose [arg1] | [arg2] | [arg3] ...`",
				msg
			);
		}
	}
});

function AddChooseState(valid_options, choosen, msg) {
	let data = userdata[msg.author.id];
	if (!userdata_prev[msg.author.id]) userdata_prev[msg.author.id] = [];
	if (!data) data = [-1, []];
	lastid = data[0];
	data[0] = data[0] + 1;
	data[1].push(valid_options);
	userdata_prev[msg.author.id].push(choosen);
	userdata[msg.author.id] = data;
}
function CheckChoosen(choosen, msg) {
	let data = userdata[msg.author.id];
	if (!data) data = [-1, []];
	lastid = data[0];
	if (data[1][lastid].includes(choosen)) {
		return true;
	}
	return false;
}
function BackChoosen(msg) {
	let data = userdata[msg.author.id];
	if (!data) data = [0, []];
	lastid = data[0];
	if (lastid >= 0) {
		data[0] = data[0] - 1;
		data[1] = data[1].slice(0, lastid);
		userdata_prev[msg.author.id] = userdata_prev[msg.author.id].slice(
			0,
			lastid
		);
		userdata[msg.author.id] = data;
	}
}
function ClearChoosen(msg) {
	if(!userdata)userdata = {};
	if(!userdata[msg.author.id])userdata[msg.author.id] = [];
	userdata[msg.author.id] = null;
}
function SetChoosen(msg,data) {
	ClearChoosen(msg);
	userdata[msg.author.id] = data;
}
SendBotMsg = function (content, msg) {
	if(!messages[msg.author.id])messages[msg.author.id] = [];
	messages[msg.author.id].push([0,content]);

	splitcontent = SplitContent(content);
	splitcontent.forEach((element) => {
		msg.channel.send(element);
	});
};
SendBotMsgINCodeBlock = function (content, msg, before, after) {
	if(!messages[msg.author.id])messages[msg.author.id] = [];
	messages[msg.author.id].push([1,[content,before,after]]);

	splitcontent = SplitContent(content);
	splitcontent.forEach((element, i) => {
		if (splitcontent.length > 1) {
			if (i == 0) msg.channel.send(element + after);
			else if (i == splitcontent.length - 1)
				msg.channel.send(before + element);
			else msg.channel.send(before + element + after);
		} else msg.channel.send(element);
	});
};

SplitContent = function(content){
		//dzielenie przez 2000 \\DONE
		var maxlength = 1990;
		var splitcontent_br = content.split("\n");
		var splitcontent = [];
		var str = "";
		splitcontent_br.forEach((element) => {
			if (str.length < maxlength) {
				if ((str + element).length <= maxlength) {
					str += element + "\n";
				} else {
					splitcontent.push(str);
					str = "";
					if ((str + element).length <= maxlength) {
						str += element + "\n";
					}
				}
			}
		});
		splitcontent.push(str);
		return splitcontent;
}

ResendMessage = function(msg,index){
	try{
	if(messages[index][0]==0){
		SendBotMsg(messages[index][1],msg);
	}
	if(messages[index][0]==1){
		SendBotMsg(messages[index][1][0],msg,messages[index][1][1],messages[index][1][2]);
	}}catch{}
}