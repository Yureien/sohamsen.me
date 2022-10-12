// Variables.

var terminal_user_title = "guest@sohamsen.me $";
var home_dir = "home/";
// Hardcoded files and links for better performance.
var ls_files = ["aboutme.txt", "skills.txt", "hobbies.txt", "email.txt", "footer.txt"];
var links = new Map([
    ["GitHub", "https://github.com/Yureien/"],
    ["LinkedIn", "https://www.linkedin.com/in/soham-sen-9a613a159/"],
    ["Steam", "https://steamcommunity.com/id/one_random_ghost/"],
    ["Telegram", "https://t.me/NotRandomGhost"],
    ["Blog", "https://blog.sohamsen.me/"],
    ["Main-Site", "https://sohamsen.me/"],
]);
var cmd_help = new Map([
    ["help", "Command: help\nDisplay this help message."],
    ["cat", "Command: cat <file name>\nExample: cat email.txt\nRead and display a file on the screen. A list of files can be found using the command 'ls'."],
    ["cd", "Command: cd <link name>\nExample: cd linkedin\nGo to a link. A list of links can be found using the command 'ls'."],
    ["ls", "Command: ls\nList all the links and files available."],
    ["nowplaying", "Command: nowplaying\nShow the song I'm currently listening to."],
    ["clear", "Command: clear\nClear the terminal."]
]);

// Setup.

function smart_split(input, del, empty_space) {
    if (input.length === 0) return input;
    var outputs = [""];

    var compare = function (base, insert, position) {
        if ((position + insert.length) > base.length) return false;
        for (var i = 0; i < insert.length; i++) {
            if (!(base.charAt(position + i) === insert.charAt(i))) return false;
        }
        return true;
    };

    var quotes = false;
    for (var i = 0; i < input.length; i++) {
        var char = input.charAt(i);
        if (char === '"') {
            quotes = !quotes;
            continue;
        }

        if (!quotes && compare(input, del, i)) {
            outputs.push("");
            i += del.length - 1;
            continue;
        }

        outputs[outputs.length - 1] += char;
    }

    if (!empty_space) {
        for (var i = 0; i < outputs.length; i++) {
            if (outputs[i] === "") {
                outputs.splice(i, 1);
            }
        }
    }

    return outputs;
}

function update_user_title(title) {
    terminal_user_title = title;
    document.getElementById("input_title").innerText = terminal_user_title + " > ";
}

update_user_title(terminal_user_title);

var current_block;

function new_block() {
    var wrapper = document.getElementById('wrapper');
    current_block = document.createElement("div");
    current_block.classList.add("log");
    wrapper.appendChild(current_block);
}

function block_log(message) {
    current_block.innerHTML += `<p>${message}</p>`;
    window.scrollTo(0, document.body.scrollHeight);
}

function log(message) {
    var wrapper = document.getElementById('wrapper');
    wrapper.innerHTML += `<div class='log'><p>${message}</p></div>`;
}

document.getElementById('input_source').onblur = function () {
    document.getElementById("input_source").focus();
};

document.getElementById('input_source').addEventListener('keyup', submit_command);

var registry = new Map();

function register_cmd(cmd_name, func) {
    registry.set(cmd_name.toString(), func);
}

function submit_command() {
    event.preventDefault();
    if (!(event.keyCode === 13)) return;
    var command = document.getElementById("input_source").value;
    document.getElementById("input_source").value = "";

    exec_command(command);
}

function exec_command(command) {
    new_block();
    block_log(terminal_user_title + " > " + command);

    if (registry.has(command.split(" ")[0])) {
        registry.get(command.split(" ")[0])(command);
    } else {
        block_log(`${command.split(" ")[0]}: command not found. Type 'help' for list of commands.`);
    }
}

function case_insensitive_link_search(link_txt) {
    link = null;
    links.forEach(function (val, key) {
        if (key.toLowerCase() == link_txt.toLowerCase()) {
            link = val;
            return;
        }
    });
    return link;
}

// Commands.

register_cmd("help", function (cmd) {
    block_log("Command List: ");
    registry.forEach(function (value, key, map) {
        block_log(`&nbsp;- ${key}`);
        if (cmd_help.has(key)) {
            cmd_help.get(key).split("\n").forEach(function (item) {
                block_log(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${item}`);
            });
        }
        block_log('');
    });
    block_log("To use a command, do '&lt;command name&gt; [&lt;optional arguments&gt;]' without the quotes.");
});

register_cmd("cat", function (cmd) {
    var parameters = smart_split(cmd, " ", false).slice(1);

    if (parameters.length === 0) {
        block_log("Please specify the file you would like to read! Example: 'cat aboutme.txt'. You can view files available with 'ls'.");
        return;
    }

    var request = new XMLHttpRequest();
    if (window.matchMedia('(max-device-width: 960px)').matches) {
        request.open('GET', home_dir + "mobile." + parameters[0], false);
        request.send(null);

        if (request.status != 200) {
            request.open('GET', home_dir + parameters[0], false);
            request.send(null);
        }
    } else {
        request.open('GET', home_dir + parameters[0], false);
        request.send(null);
    }
    if (request.status == 200)
        block_log(request.responseText.replace(/ (?![^<]*>)/g, "&nbsp;").replace(/\n/g, "<br>"));
    else {
        block_log(`cat: ${parameters[0]}: No such file! Do 'ls' for a list of files available.`);
    }

    if (parameters[0] === "aboutme.txt") {
        fetch("https://splaying.sohamsen.workers.dev/np/?uid=f4d46cc927d3cd6a203359693f0439d1ceab6da7ae884cb656a8589d65c91aea")
            .then(resp => resp.json())
            .then(data => {
                if (data.spotify_running !== true) return;
                if (data.error !== undefined) return;
                const d = data.item;
                block_log(`I am currently listening to <a href="${d.external_urls.spotify}">${d.name}</a> by <a href="${d.artists[0].external_urls.spotify}">${d.artists[0].name}</a>.`);
            });
    }
});

register_cmd("cd", function (cmd) {
    var parameters = smart_split(cmd, " ", false).slice(1);

    if (parameters.length === 0) {
        block_log("Please specify the link you would like to access! Example: 'cd github'. You can view links available with 'ls'.");
        return;
    }

    var link = case_insensitive_link_search(parameters[0]);

    if (link !== null) {
        block_log(`<a href=${link}>${link}</a>`);
        window.open(link, "_blank");
    } else {
        block_log(`cd: ${parameters[0]} not found! Type 'ls' for a list of available links.`);
    }
});

register_cmd("clear", function (cmd) {
    var wrapper = document.getElementById('wrapper');
    wrapper.innerHTML = '';
});

register_cmd("ls", function (cmd) {
    var ls_txt = "Files (Type 'cat &lt;name of file&gt;' to access):<br>";
    ls_files.forEach(function (item) {
        ls_txt += item + "    ";
    });

    ls_txt += "<br><br>Links (Type 'cd &lt;name of link&gt;' to access):<br>";
    links.forEach(function (val, key) {
        ls_txt += `<b><a href="${val}" style="color:#00e676">${key}/</a></b>    `;
    });

    block_log(ls_txt);
});

register_cmd("nowplaying", function(cmd) {
    fetch("https://splaying.sohamsen.workers.dev/np/?uid=f4d46cc927d3cd6a203359693f0439d1ceab6da7ae884cb656a8589d65c91aea")
    .then(resp => resp.json())
    .then(data => {
        if (data.spotify_running !== true || data.error !== undefined) {
            block_log("I am currently not listening to any song!");
            return;
        };
        const d = data.item;
        block_log(`I am currently listening to <a href="${d.external_urls.spotify}">${d.name}</a> by <a href="${d.artists[0].external_urls.spotify}">${d.artists[0].name}</a>.`);
    });
});


// Default.

exec_command("cat aboutme.txt");