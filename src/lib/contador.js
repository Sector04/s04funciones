var objCaja;

$(function(){	
    $(document).on("cargar_controles", function(sender,id) {
        var contenedor='';
		
        if(id!=undefined) contenedor='#'+id+'';
        $(contenedor+" [data-tipo='contador']").each(function(obj,ind){
        	$(this).contador();
        });
    });
});


(function( $ ){
    var metodos = {
        init : function(options) {			
			return this.each(function() {
				var elem=this;
				var i=0;

			    // Configuración por defecto
			    var defaults = {
			        textSegundos: "Seg.",
			        textNuevaSecuencia: "Nueva secuencia"
			    };        	    
                elem.config = $.extend( {}, defaults, options );
                elem.cargando=false;

                //Creo los objetos necesarios
		        elem.tbl=$('<table class="table"></table>');
				elem.tbo=$('<tbody></tbody>');
				elem.tbe=$('<thead></thead>');
				elem.btn=$('<button class="nue btn btn-primary form-control">'+elem.config.textNuevaSecuencia+'</button>');

				//Agrego las cabeceraas
				for(i=1;i<11;i++) elem.tbe.append('<th width="8%" class="text-center">'+i+'</th>');
				elem.tbe.append('<th width="4%">&nbsp;</th>');
				elem.tbe.append('<th width="5%" class="text-center"><span class="glyphicon glyphicon-retweet"></span></th>');
				elem.tbe.append('<th width="3%">&nbsp;</th>');

				//Evento para agregar una fila
				elem.btn.on('click',function(e){e.preventDefault();metodos.agregar_linea.call(elem);});

				//Cargo los valores del control
				metodos.cargar_datos.call(elem,$(elem).val());

				//Agrego la tabla por encima del control
				elem.tbl.append(elem.tbe);
				elem.tbl.append(elem.tbo);
				$(elem).before(elem.tbl);
				$(elem).before(elem.btn);

			});
        },
        agregar_linea : function(valores,repeticiones) {
			var fil=$('<tr></tr>');
			var slr=$('<select class="form-control rep"></select>');
			var bta=$('<button class="btn btn-default agr"><span class="glyphicon glyphicon-plus"></span></button>');
			var bte=$('<button class="btn btn-default eli" style="display:none;"><span class="glyphicon glyphicon-menu-left"></span></button>');
			var bts=$('<button class="btn btn-default son"><span class="glyphicon glyphicon-volume-up"></span></button>')
			var elem=this;
			var i=0;
			
			//Agrego las celdas
			for(i=1;i<14;i++) fil.append('<td></td>');

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
			fil.find('td:eq(0)').append(bte).append(bta);
			fil.find('td:eq(11)').append(slr);
			fil.find('td:eq(12)').append(bts);

			//Agrego un evento al botón
			bta.on('click',function(){metodos.agregar_sel_seg.call(elem,this)});
			bte.on('click',function(){metodos.eliminar_sel_seg.call(elem,this)});
			bte.on('click',function(){metodos.sonar_secuencia.call(elem,this)});
			slr.on('change',function(){metodos.eliminar_linea_contador.call(elem,this)});

			//Cargo los valores
			console.log(valores);
			$(valores).each(function(ind,val){
				bta.attr('data-val',val);
				bta.click();
			});

			//Agrego la fila a la tabla
			this.tbo.append(fil);

			metodos.refrescar_valor.call(elem);
		},
		agregar_sel_seg : function(boton){
			var sls=$('<select class="form-control seg"></select>');
			var td=$(boton).parent();
			var tr=td.parent();
			var bta=td.find('.agr');
			var bte=td.find('.eli');
			var elem=this;
			var i=0;

			//Si no tiene le agrego un valor por defecto
			if($(boton).attr('data-val')==undefined){
				if(td.prev('td').length>0){
					$(boton).attr('data-val',td.prev('td').find('select').val());
				}else $(boton).attr('data-val',1);
			}
			
			//Agrego los valores al selector de repeticiones
			for(i=0.5;i<10.5;i=i+0.5){
				var opt=$('<option value="'+i+'">'+i+' seg.</option>');
				if($(boton).attr('data-val')==i) opt.attr('selected','selected');	
				sls.append(opt);
			} 	

			//Quito el valor por defecto del botón
			$(boton).removeAttr('data-val');

			//Agrego el evento al cambio de segundos
			sls.on('change',function(){metodos.refrescar_valor.call(elem);});			

			td.addClass('sel')
			td.append(sls);
			td.next('td').append(td.find('button'));		

			if(tr.find('td.sel').length>1) bte.show();
			if(tr.find('td.sel').length>9) bta.hide();

			metodos.refrescar_valor.call(elem);

		},
		eliminar_sel_seg : function(boton){
			var td=$(boton).parent();
			var tr=td.parent();
			var bta=td.find('.agr');
			var bte=td.find('.eli');

			td.prev('td').removeClass('sel').html('').append(td.find('button'));		

			if(tr.find('td.sel').length<2) bte.hide();
			if(tr.find('td.sel').length<10) bta.show();
			metodos.refrescar_valor.call(this);
		},
		eliminar_linea_contador : function(boton){
			var tr=$(boton).parent().parent();
			if($(boton).val()==0) tr.remove();
			metodos.refrescar_valor.call(this);
		},
		cargar_datos : function(valor){
			var lineas=valor.split('#');
			var i=0;

			this.cargando=true;
			for(i=0;i<lineas.length;i++){
				var conf=lineas[i].split(';');
				metodos.agregar_linea.call(this,conf[0].split(','),conf[1]);
			}
			this.cargando=false;
		},
		refrescar_valor : function(){
			if(!this.cargando){
				var resultado='';			
				this.tbo.find('tr').each(function(ind,obj){
					if(resultado!='') resultado+='#';
					var val_lin='';
					$(obj).find('select.seg').each(function(ind,obj){
						if(val_lin!='') val_lin+=',';
						val_lin+=$(obj).val();
					});
					resultado+=val_lin+';'+$(obj).find('select.rep').val();
				});
				$(this).val(resultado);
			}
		},
		sonar_secuencia:function(boton){

		}
    };

    $.fn.contador = function(methodOrOptions) {
        if ( metodos[methodOrOptions] ) {
            return metodos[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
            // Default to "init"
            return metodos.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.tooltip' );
        }    
    };


})( jQuery );