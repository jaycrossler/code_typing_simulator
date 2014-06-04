var typer = {
    topCellHolder: null,
    topCells: [],
    bottomCell: null,
    textHolder: null,
    sentences_on_bottom: [],
    sentence_current:"",
    time_between_chars: 15,
    time_between_words: 50,
    chance_of_misspell: 0.015,
    starting_text: "ENTER any text to fake type here, or click button below to use space sample",
    current_top:0
};

typer.init = function(){
    typer.bottomCell = $("#bottom_cell");
    typer.topCellHolder = $("#top_cells");
    typer.textHolder = $("#source_holder")
        .val(typer.starting_text);
    typer.addTopCell();

    $("#type_on")
        .on('click',function(){
            var box_val = typer.textHolder.val();
            if (box_val == typer.starting_text || box_val == "") {
                box_val = $("#sample_text").text();
            }
            typer.textHolder.val(box_val);
            typer.text_to_add = box_val;

            typer.add_char_from_text();
        });

    var lazyResize = _.debounce(typer.resizeCells, 20);
    $(window).resize(lazyResize);

};
typer.addTopCell = function(){
    var $tc1 = $("<div>")
        .addClass("type_holder")
        .appendTo(typer.topCellHolder);
    var $tc2 = $("<div>")
        .addClass("holder")
        .appendTo($tc1);
    typer.topCells.push($tc2);

    typer.resizeCells();
    return $tc2;
};
typer.resizeCells = function(){
    var currSize = parseInt(typer.topCells[0].css('fontSize'));
    var newSize = currSize-1;
    if (newSize < 2) return;

   _.each(typer.topCells, function($cell,i){
        var total_width = $(document).width()-24;
        var num_cells = typer.topCells.length;
        var cell_width = parseInt((total_width / num_cells)-12);
        $cell.outerWidth(cell_width);

        $cell.css('fontSize',newSize);
    });

};
typer.randomChar = function(){
    var chars = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:;[]';";
    var words = "an tiem time _ ! delay cloud star stellar gravity luna space man woman science blow dust";
    var output = "";
    var choice = 0;
    if (Math.random()<.7){
        choice = parseInt(Math.random() * chars.length);
        output = chars.substr(choice,1);
    } else {
        var wordsA = words.split(" ");
        choice = parseInt(Math.random() * wordsA.length);
        output = wordsA[choice];
    }
    return output;
};

typer.add_char_from_text = function(){
    if (typer.text_to_add && typer.text_to_add.length) {
        if (!typer.start_timer) {
            typer.start_timer =  new Date().getTime();
        }
        var char = typer.text_to_add.substr(0,1);
        var charSize = 1;
        if (char==" "){
            var stillSpace=true;
            while (stillSpace && charSize < 40) {
                var nextChar = typer.text_to_add.substr(charSize,1);
                if (nextChar==" "){
                    char+=nextChar;
                    charSize++;
                } else {
                    stillSpace = false;
                }
            }
        }

        var time_to_delay = typer.get_delay_time(char);

        //Do Misspellings
        if (!typer.isSpacer(char) && Math.random() < typer.chance_of_misspell) {
            var t = typer.bottomCell.html() || "";

            typer.bottomCell.html(t + typer.randomChar());
            setTimeout(function(){
               typer.bottomCell.html(t);
               setTimeout(function(){typer.add_char_from_text()},time_to_delay*4);
            },time_to_delay*2);
        } else {
            typer.text_to_add = typer.text_to_add.substr(charSize);
            typer.add_char(char);
            setTimeout(function(){typer.add_char_from_text()},time_to_delay);
        }

    } else {
        if (typer.start_timer) {
            //Text finished drawing
            var end = new Date().getTime();
            var time = end - typer.start_timer;
            time = time / 1000;
            typer.start_timer = null;
            $("#type_on").val("Type This - Last took: "+time+" seconds");
        }
    }
};
typer.isSpacer = function(char){
    char = char.substr(0,1);
    return (char == " " || char == "\t" || char == "\n" || char == ":" || char == "=");
};
typer.get_delay_time = function(char){
    char = char.substr(0,1);
    var spacing;
    if (typer.isSpacer(char)) {
        spacing = typer.time_between_words;
    } else {
        spacing = typer.time_between_chars;
    }

    return parseInt((spacing *.25) + (Math.random()*(spacing *.75)));
};
typer.add_char = function(w){
    var t = typer.bottomCell.html() || "";
    var newLine = false;
    if (w == "\n"){
        w = "<br>";

        var rows = t.split("<br>");
        var rowCount = 0;
        if (rows && rows.length) rowCount = rows.length;
        if (rowCount > 20) {
            var topLine = typer.sentences_on_bottom[0];
            typer.sentences_on_bottom = typer.sentences_on_bottom.slice(1);
            var currTop = typer.topCells[typer.current_top];

            var html = currTop.html();
            currTop.html(html+topLine);

            var currTopHeight = currTop.height();

            if (currTopHeight > 190) {
                typer.current_top++;
                if (typer.current_top>=typer.topCells.length) {
                    typer.addTopCell();

                    if (typer.current_top % 4==0){
                        typer.current_top=0;
                    }

                }

                var end = new Date().getTime();
                var time = end - typer.start_timer;
                time = time / 1000;
                $("#type_on").val("Typing - So Far: "+time+" seconds");
            }

        }
        newLine = true;
    }
    w = w.replace(/ /g,"&nbsp;");
    typer.sentence_current += w;

    if (newLine) {
        typer.sentences_on_bottom.push(typer.sentence_current);
        typer.sentence_current = "";

        var newText = typer.sentences_on_bottom.join("");
        typer.bottomCell.html(newText);
    } else {
        typer.bottomCell.html(t + w);
    }

};

$(document).ready(function(){
    typer.init();
});