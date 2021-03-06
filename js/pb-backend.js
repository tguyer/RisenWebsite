window.onload = function() {
  playerbaseStyling();
  var path = window.location.pathname;
  var page = path.split("/").pop();
  var data = page.split(".").shift();
  dataUrl = "https://raw.githubusercontent.com/tguyer/RisenEsports/master/data/" + data + ".txt";

  var request = new XMLHttpRequest();
  request.open('GET', dataUrl, true);
  request.responseType = 'blob';
  request.onload = function() {
      var reader = new FileReader();
      reader.readAsDataURL(request.response);
      reader.onload =  function(e){
          plainData = b64DecodeUnicode(e.target.result.split(",")[1]);
          var processed = teamProcess(plainData);
          var teams = processed[0];
          var playerData = processed[1];
          var coachData = processed[2];

          for (var i=0; i<teams.length; i++) {
            document.getElementById("t"+i).innerHTML = teams[i];
            // Find players on the current team
            var players = playerData.filter(function(obj) {
              return obj.team == teams[i];
            });

            // Display the starters
            for (var k=0; k<5; k++) {
              var captain = "";
              // Deal with Captains
              if (players[k].name.slice(-1) == "*") {
                captain = "*";
                players[k].name = players[k].name.slice(0, -1);
              }

              document.getElementById("t"+i+"st"+k).innerHTML = "<a title='op.gg link' href = 'https://na.op.gg/summoner/userName=" +
              players[k].name + "'>" + players[k].name + captain + "</a> <span class='pos'>" + players[k].pos + "</span>";
            }

            // Display the subs
            for (var k=0; k<2; k++) {
              if(typeof players[k+5] != "undefined") {
                document.getElementById("t"+i+"s"+k).innerHTML = "<a title='op.gg link' href = 'https://na.op.gg/summoner/userName=" +
                players[k+5].name +  "'>" + players[k+5].name + "</a>";
              } else {
                document.getElementById("t"+i+"s"+k).innerHTML = "<span style='opacity:.6'>Sub Slot "+ (k+1) + "</span>";
              }
            }

            // Display the coaches
            var coach = coachData.filter(function(obj) {
              return obj.team == teams[i];
            });
            if(typeof coach[0] != "undefined") {
              document.getElementById("t"+i+"c0").innerHTML = "<a title='op.gg link' href = 'https://na.op.gg/summoner/userName=" +
              coach[0].name +  "'>" + coach[0].name + "</a>";
            } else {
              document.getElementById("t"+i+"c0").innerHTML = "<span style='opacity:.6'>None</span>";
            }
          }

          // Show update log
          document.getElementById("lastUpdated").innerHTML = "<a href='https://github.com/tguyer/RisenEsports/commits/master/data/" +
          data + ".txt'> Update History </a>";

      };
  };
  request.send();
}

var pos = ["Top", "Jungle", "Mid", "Adc", "Support"];

function teamProcess(plainData) {
  var teams = [];
  var playerData = [];
  var coachData = [];

  var newData = plainData.split("-");
  newData = newData.filter(Boolean);
  // Loop through the teams
  for (var i=0; i<newData.length; i++) {
    teamInfo = newData[i].split("|");
    teamInfo = teamInfo.filter(function(entry) { return entry.trim() != ''; });
    // 0 = Team name, 1 = Starters, 2 = Subs
    teamNameCoach = teamInfo[0].split(":"); // [0] = name, [1] = coach name
    teams.push(teamNameCoach[0]); // Add team to team list
    if(typeof teamNameCoach[1] != "undefined") {
      var coach = new Object();
      coach.name = teamNameCoach[1];
      coach.team = teamNameCoach[0];
      coachData.push(coach);
    }

    // Add starters to playerbase
    var starters = teamInfo[1].split(":");
    for(var k=0; k<starters.length; k++) {
      var player = new Object();
      player.name = starters[k];
      player.team = teamNameCoach[0];
      player.pos = pos[k];
      playerData.push(player);
    }

    // Add subs to playerbase
    if(teamInfo.length > 2) {
      var subs = teamInfo[2].split(":");
      for(var k=0; k<subs.length; k++) {
        var player = new Object();
        player.name = subs[k];
        player.team = teamNameCoach[0];
        playerData.push(player);
      }
    }
  }
  playerbaseStyling(teams.length);
  return [teams, playerData, coachData];
}



// Generates HTML for the player base page
function playerbaseStyling(teamLen) {
  for(var j=0; j<(teamLen/5); j++) {
    var row = document.getElementById("r"+j);

    for(var i=0; i<5; i++) {
      var offset = j*5;

      // Create team components
      var teamDom = document.createElement("div");
      teamDom.className = "2u";
      var sec = document.createElement("section");
      var teamTit = document.createElement("h3");
      teamTit.id = "t" + (i+offset);
      teamTit.innerHTML = "Team " + (i+offset);
      sec.appendChild(teamTit);

      // STARTERS
      var start = document.createElement("p");
      var bold = document.createElement("b");
      bold.innerHTML = "STARTERS";
      start.appendChild(bold);
      sec.appendChild(start);

      for(var k=0; k<5; k++) {
        var player  = document.createElement("p");
        player.id = "t" + (i+offset) + "st" + k;
        player.innerHTML = "Starter " + k;
        sec.appendChild(player);
      }

      // SUBS
      var spce = document.createElement("br");
      sec.appendChild(spce);
      var sub = document.createElement("p");
      var subold = document.createElement("b");
      subold.innerHTML = "SUBS";
      sub.appendChild(subold);
      sec.appendChild(sub);

      for(var k=0; k<2; k++) {
        var player  = document.createElement("p");
        player.id = "t" + (i+offset) + "s" + k;
        player.innerHTML = "Sub " + k;
        sec.appendChild(player);
      }

      // COACH
      var spce1 = document.createElement("br");
      sec.appendChild(spce1);
      var coach = document.createElement("p");
      var cobold = document.createElement("b");
      cobold.innerHTML = "COACH";
      coach.appendChild(cobold);
      sec.appendChild(coach);

      var coach1 = document.createElement("p");
      coach1.id = "t" + (i+offset) + "c" + 0;
      coach1.innerHTML = "Coach " + 0;
      sec.appendChild(coach1);

      // Add everything
      teamDom.appendChild(sec);
      row.appendChild(teamDom);
    }
  }
}


// Decoder
function b64DecodeUnicode(str) {
   return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
   }).join(''));
}
