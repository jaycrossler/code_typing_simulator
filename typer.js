var typer = {};
typer.topCellHolder = null;
typer.topCells = [];
typer.bottomCell = null;
typer.textHolder = null;
typer.words_to_add = [];

typer.init = function(){
    typer.bottomCell = $("#bottom_cell");
    typer.topCellHolder = $("#top_cells");
    typer.textHolder = $("#source_holder");
    typer.addTopCell();
    typer.addTopCell();
    typer.addTopCell();

    console.log("Inited");

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
    typer.topCells.push($tc1);

    typer.resizeCells();
    return $tc1;
};
typer.resizeCells = function(){
   _.each(typer.topCells, function($cell,i){
        $cell.text(i);
        var total_width = $(document).width();
        var num_cells = typer.topCells.length;
        var cell_width = parseInt((total_width / num_cells)-18);
        $cell.width(cell_width);
    });
};
typer.type_on = function(){
    var text_entered = typer.textHolder.text();
    typer.words_to_add = text_entered.split(" ");

    typer.add_word_from_array();
};
typer.add_word_from_array = function(){
    if (typer.words_to_add.length > 0) {
        var word = typer.words_to_add[0];
        typer.words_to_add = typer.words_to_add.slice(1);
        var time = parseInt(Math.random()*300);
        typer.add_word(word);
        setTimeout(function(){typer.add_word_from_array()},time);
    }
};
typer.add_word = function(w){
    var t = typer.bottomCell.text();
    typer.bottomCell.text(t + " " + w);
};