$(function(){
    $(document).on("cargar_controles", function(sender,id) {
        var contenedor='';
        if(id!=undefined) contenedor='#'+id+'';
        $(contenedor+" [data-tipo='color']").colorselector();
    });
});
