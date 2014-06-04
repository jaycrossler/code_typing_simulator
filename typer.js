var typer = {
    topCellHolder: null,
    topCells: [],
    bottomCell: null,
    textHolder: null,
    sentences_on_bottom: [],
    sentence_current:"",
    time_between_chars: 4,
    time_between_words: 8,
    chance_of_misspell: 0.02,
    current_top:0,
    top_cell_height: 14
};

typer.init = function(){
    typer.bottomCell = $("#bottom_cell");
    typer.topCellHolder = $("#top_cells");
    typer.textHolder = $("#source_holder");
    typer.addTopCell();

    $("#type_on")
        .on('click',function(){
            typer.type_on();
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
   _.each(typer.topCells, function($cell,i){
        var total_width = $(document).width();
        var num_cells = typer.topCells.length;
        var cell_width = parseInt((total_width / num_cells)-20);
        $cell.width(cell_width);
    });
};
typer.type_on = function(){
    typer.text_to_add = typer.textHolder.val();

    typer.add_char_from_text();
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
        var char = typer.text_to_add.substr(0,1);
        typer.text_to_add = typer.text_to_add.substr(1);

        var time_to_delay = typer.get_delay_time(char);

        //Do Misspellings
        if (!typer.isSpacer(char) && Math.random() < typer.chance_of_misspell) {
            time_to_delay *= 4;
            var t = typer.bottomCell.html() || "";

            setTimeout(function(){
                typer.bottomCell.html(t + typer.randomChar());
                setTimeout(function(){
                   typer.bottomCell.html(t);
                },time_to_delay);
            },time_to_delay);
            time_to_delay *=3;
        }

        typer.add_char(char);
        setTimeout(function(){typer.add_char_from_text()},time_to_delay);
    }
};
typer.isSpacer = function(char){
    return (char == " " || char == "\t" || char == "\n" || char == ":" || char == "=");
};
typer.get_delay_time = function(char){
    var spacing;
    if (typer.isSpacer(char)) {
        spacing = typer.time_between_words;
    } else {
        spacing = typer.time_between_chars;
    }

    return parseInt((spacing *.25) + (Math.random()*(spacing *.75)));
};
typer.make_top_cells_smaller_font = function(){
    var currSize = parseInt(typer.topCells[0].css('fontSize'));
    var newSize = currSize-1;
    _.each(typer.topCells, function($cell,i){
        $cell.css('fontSize',newSize);
    });
    typer.top_cell_height+=2;
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
            var html = typer.topCells[typer.current_top].html();
            typer.topCells[typer.current_top].html(html+topLine);

            rows = html.split("<br>");
            rowCount = 0;
            if (rows && rows.length) rowCount = rows.length;

            if (rowCount > typer.top_cell_height) {
                typer.current_top++;
                if (typer.current_top>=typer.topCells.length) {
                    typer.addTopCell();

                    typer.make_top_cells_smaller_font();

                    if (typer.current_top % 4==0){
                        typer.current_top=0;
                    }

                }
            }

        }
        newLine = true;
    } else if (w == " "){
        w = "&nbsp;";
    }
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