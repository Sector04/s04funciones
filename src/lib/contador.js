var objCaja;

$(function(){	
    $(document).on("cargar_controles", function(sender,id) {
        var contenedor='';
		
        if(id!=undefined) contenedor='#'+id+'';
        $(contenedor+" [data-tipo='contador']").each(function(obj,ind){
        	objCaja=$(this);
	        var tbl=$('<table class="table"></table>');
			var tbo=$('<tbody></tbody>');
			var tbe=$('<thead></thead>');
			var btn=$('<button class="nue btn btn-primary form-control">Nueva secuencia</button>');

			//Agrego las cabeceraas
			for(i=1;i<11;i++) tbe.append('<th width="8%" class="text-center">'+i+'</th>');
			tbe.append('<th width="4%">&nbsp;</th>');
			tbe.append('<th width="8%" class="text-center"><span class="glyphicon glyphicon-retweet"></span></th>');

			//Evento para agregar una fila
			btn.on('click',function(e){e.preventDefault();agregar_linea(tbl);});

			//Cargo los valores del control
			cargar_datos_contador($(this).val(),tbo);

			tbl.append(tbe);
			tbl.append(tbo);
			$(this).before(tbl);
			$(this).before(btn);
        });
    });
});

function agregar_linea(tabla,valores,repeticiones){
	var fil=$('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
	var slr=$('<select class="form-control rep"></select>');
	var bta=$('<button class="btn btn-default agr">+</button>')
	var bte=$('<button class="btn btn-default eli" style="display:none;"><</button>')
	var i=0;
	
	//Si no tiene valores ni repeticiones le marco una por defecto
	if(valores==undefined) valores=[1];
	if(repeticiones==undefined) repeticiones=1;

	//Agrego los valores al selector de repeticiones
	for(i=0;i<21;i++) {
		var opt=$('<option value="'+i+'">'+i+'</option>');
		if(i==repeticiones) opt.attr('selected','selected');
		slr.append(opt);
	}
	
	//Agrego la combo de repecticiones a la fila
	fil.find('td:eq(11)').append(slr);
	fil.find('td:eq(0)').append(bte).append(bta);

	//Agrego un evento al botón
	bta.on('click',agregar_sel_seg);
	bte.on('click',eliminar_sel_seg);
	slr.on('change',eliminar_linea_contador);

	//Cargo los valores
	$(valores).each(function(ind,val){
		bta.attr('data-val',val);
		bta.click();
	});

	//Agrego la fila a la tabla
	tabla.append(fil);
}

function agregar_sel_seg(e){
	e.preventDefault();
	var sls=$('<select class="form-control seg"></select>');
	var td=$(this).parent();
	var tr=td.parent();
	var bta=td.find('.agr');
	var bte=td.find('.eli');
	var i=0;

	//Si no tiene le agrego un valor por defecto
	if($(this).attr('data-val')==undefined){
		if(td.prev('td').length>0){
			$(this).attr('data-val',td.prev('td').find('select').val());
		}else $(this).attr('data-val',1);
	}
	
	//Agrego los valores al selector de repeticiones
	for(i=0.5;i<10.5;i=i+0.5){
		var opt=$('<option value="'+i+'">'+i+' seg.</option>');
		if($(this).attr('data-val')==i) opt.attr('selected','selected');	
		sls.append(opt);
	} 	

	//Quito el valor por defecto del botón
	$(this).removeAttr('data-val');

	td.addClass('sel')
	td.append(sls);
	td.next('td').append(td.find('button'));		

	if(tr.find('td.sel').length>1) bte.show();
	if(tr.find('td.sel').length>9) bta.hide();

	calcular_datos();
}

function eliminar_sel_seg(e){
	e.preventDefault();
	var td=$(this).parent();
	var tr=td.parent();
	var bta=td.find('.agr');
	var bte=td.find('.eli');

	td.prev('td').removeClass('sel').html('').append(td.find('button'));		

	if(tr.find('td.sel').length<2) bte.hide();
	if(tr.find('td.sel').length<10) bta.show();

}

function eliminar_linea_contador(){
	var tr=$(this).parent().parent();
	if($(this).val()==0) tr.remove();
}

function cargar_datos_contador(valor,tabla){
	var lineas=valor.split('#');
	var i=0;

	for(i=0;i<lineas.length;i++){
		var conf=lineas[i].split(';');
		agregar_linea(tabla,conf[0].split(','),conf[1]);
	}
};

