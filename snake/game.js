var speed=150;
 var dir=1;
 var snake=["3_10","2_10","1_10"];
 var bug=""; 
 function myinit(){
	dir=1;
	snake=["3_10","2_10","1_10"];
	bug="";
	$('#div_main').html("");
	for (var r=0;r<20;r++){
	  for (var c=0;c<20;c++){
	$('#div_main').append('<div class=curr_cell id=c_'+r+'_'+c+'></div>');
	  }
	}
	  $('#c_1_10').addClass('cell_bg');
	  $('#c_2_10').addClass('cell_bg');
	  $('#c_3_10').addClass('cell_bg');
	  generatebug();
	  setTimeout(function(){gameupdate()}, speed);
 }
 myinit();
 function generatebug(){
	var r1 = Math.floor(Math.random() * 19);
	var c1 = Math.floor(Math.random() * 19);
	$('#c_'+r1+'_'+c1).addClass('cell');
	bug=''+r1+'_'+c1;
 } 
 function gameupdate()	{
		var tail=snake.pop(); 
		  $('#c_'+tail).removeClass('cell_bg');
		  var hh=snake[0];
		  var rc=hh.split("_");
		  var r=parseInt(rc[0]);
		  var c=parseInt(rc[1]);
		  switch(dir){
			case 1: r=r+1; 
					break; 
			case 2: c=c-1; 
					break; 
			case 3: r=r-1; 
					break; 
			case 4: c=c+1; 
					break; 
			}  
		var nn=""+r+"_"+c;
		if (nn==bug){
			snake.push(tail);
			$('#c_'+tail).addClass('cell_bg');
			$('#c_'+bug).removeClass('cell');
			speed= speed - 5;
			generatebug();
		}
		if (c<0 || r<0 || c>19 || r>19 || $('#c_'+nn).hasClass('cell_bg') ){
			$('#gameOverModal').css('display', 'flex');
			return; // stop the loop and wait for user input
		}
		snake.unshift(nn);
		$('#c_'+nn).addClass('cell_bg');       
		setTimeout(function(){gameupdate()}, speed);
	} 
	$(document).keydown(function(e){
	if (e.keyCode == 37) { 
		dir=2;
	}	else if (e.keyCode == 38) { 
		dir=3;
	}	else if (e.keyCode == 39) { 
		dir=4;
	}	else if (e.keyCode == 40) { 
		dir=1;
	}
});

function continueGame() {
	$('#gameOverModal').css('display', 'none');
	speed = 150;
	myinit();
}

function quitGame() {
	$('#gameOverModal').css('display', 'none');
	$('#div_main').html("");
}