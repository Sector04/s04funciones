function pregunta(sender,pregunta){	
	//Muestra una pregunta que sustituye al confirm
	var preproceso;
	$('#dlgPregunta p').html(pregunta);
	$('#dlgPregunta .si').unbind('click').bind('click',function(e){e.preventDefault();preproceso=$(sender).attr('data-preproceso');$(sender).removeAttr('data-preproceso');if($(sender).is("form")) enviar_formulario(sender);else $(sender).click();$(sender).attr('data-preproceso',preproceso);$('#dlgPregunta').modal('hide');});
	$('#dlgPregunta .no').unbind('click').bind('click',function(e){e.preventDefault();$('#dlgPregunta').modal('hide');});
	$('#dlgPregunta').modal({modalOverflow:true,keyboard:false,backdrop:'static'});
	$('#dlgPregunta').modal('show');
	return false;
}

function alerta(texto){
	//Muestra una alerta
	bootbox.alert(texto);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Recargar contenido de un contenedor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function recargar_contenido(id_contenedor){
	cargar_contenido_pagina($('#'+id_contenedor).attr('data-url'),id_contenedor);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Carga la página de la url en el contenedor con el id que se le pasa
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cargar_contenido_pagina(url,id_contenedor,dialogo_tipo,callback,ocultar_carga){	
	var contenedor=$('#'+id_contenedor);

	if(url != undefined && contenedor.length>0){

		//Lanzo el evento de que se ejecuta antes de cargar el contenedor
		contenedor.trigger('data-even-precarga',[id_contenedor,url])
		
		//Miro a ver si tengo tego que mostrar el cargando
		if (ocultar_carga==undefined || !ocultar_carga) cargando(contenedor.get(),true);					
		
		contenedor.load(url, function(){		
			//Miro a ver si tengo tego que ocultar el cargando
			if (ocultar_carga==undefined || !ocultar_carga) cargando(contenedor.get(),false);		
	        
	        //Marco la url que tendrá el contenedor
	        contenedor.attr('data-url',url);	

	        //Cargo los controles del html cargado
			inicializar_subcontroles(id_contenedor);
			
			//Lanzo el evento de que el contenedor ha sido cargado
			contenedor.trigger('data-even-poscarga',[id_contenedor,url])
			
			//Si ha definido una función de retorno le llamo
			if (callback != undefined) callback.apply($(this));
			
			//Si el destino es un dialogo lo abro
			if(id_contenedor.toLowerCase().substr(0,7)=="dialogo") abrir_dialogo.apply($(this),[dialogo_tipo]);
			else{
				//Si el contenedor tiene marcado un auto refresco le añado un set timeout para que se realice el siguiente refresco
				if(contenedor.attr('data-refrescar')!=undefined && contenedor.attr('data-url')!=undefined) setTimeout(function(){if(contenedor.attr('data-url')==url) cargar_contenido(url,id_contenedor,undefined,callback,true);},contenedor.attr('data-refrescar'));
			}
		});
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Carga la página de la url en el contenedor con el id que se le pasa
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function cargar_contenido(url,id_contenedor,dialogo_tipo,callback,ocultar_carga){	

	//Compruebo que a la función se le pasa una url y un id
	if (id_contenedor != '' && url != '' && url != undefined) {
		var i;
		var urls = url.split(";");
		var contenedores = id_contenedor.split(";");
		var contenedor;

		//Miro a ver si se le están enviando varias url´s separadas por punto y coma para cargar todas ellas
		for(i=0;i<urls.length;i++){
			url=urls[i];
			id_contenedor=contenedores[i];
			contenedor=$('#'+id_contenedor);

			//Miro a ver si tengo que cargar la información en una ventana de dialogo
			if(id_contenedor.toLowerCase().substr(0,7)=="dialogo" || dialogo_tipo!=undefined) {	
				
				//Si ya existe un dialogo con ese nombre lo elimino
				if(contenedor.length){
					if(!contenedor.is(":visible")) contenedor.remove();
				} 

				//Creo el contenedor del dialogo y lanzo la carga
				$("body").append("<div class='modal fade' tabindex='-1' role='dialog' aria-hidden='true' id='"+id_contenedor+"'/>");									
				cargar_contenido_pagina(url,id_contenedor,dialogo_tipo,callback,ocultar_carga);			
			}			
			else {			
				//Compruebo que el destino existe para cargar el contenido
				if(contenedor.length) cargar_contenido_pagina(url,id_contenedor,dialogo_tipo,callback,ocultar_carga);			
			}
		}
	}	
}

//////////////////////////////////////////////////////////////////////////////
// Abrir dialogo 
//////////////////////////////////////////////////////////////////////////////
function abrir_dialogo(tipo){
	//Capturo los datos para la modal
	var dlg=this;
	var opciones;

	//En función al tipo de modal le doy unos parametros u otros
	switch(tipo){
		case '0':
			opciones={keyboard:true,backdrop:true};
			break;
		default:
			opciones={keyboard:false,backdrop:'static'}
	} 

	//Abro la modal
	if(!$(dlg).is(":visible")){
		$(this).modal(opciones);
		$(this).modal('show');
	}

	//Agrego un evento que borre la capa al ocultarse la modal
	$(this).on('hidden.bs.modal', function () {var dlg=this;setTimeout(function(){$(dlg).remove()},1000);});

	//Agrego el evento al boton de cerrar la modal
	$(this).find('.dlg_cerrar').click(function(e){e.preventDefault();$(dlg).modal("hide");});
	
}	
function cerrar_dialogo(datos){
	if(datos!=undefined && datos.correcto==undefined) $(datos).parents('.modal').modal('hide');
	else $(this).parents('.modal').modal('hide');
	return true;
}

//////////////////////////////////////////////////////////////////////////////
// Deshabilita o habilita el control 
//////////////////////////////////////////////////////////////////////////////
function habilitar(control,valor){
	//Pongo el estilo a deshabilitado
	if (!valor)	$(control).addClass('disabled');
	else $(control).removeClass('disabled');	
	$(control).children().each(function(ind,obj){habilitar(obj,valor)});
}

//////////////////////////////////////////////////////////////////////////////
// Deshabilita o habilita el control y pone o quita el icono de cargando
//////////////////////////////////////////////////////////////////////////////
function cargando(control,valor){	
	habilitar(control,!valor);
	
	if(valor) $(control).find('input[data-loading-text]').button('loading');
	else $(control).find('input[data-loading-text]').button('reset');

	$('#carg_'+$(control).attr('id')).parent().css('position',$('#carg_'+$(control).attr('id')).parent().attr('posicionamiento'));
	$('#carg_'+$(control).attr('id')).remove();
	
	if (valor && $(control).css('display')!='none') {
		if($(control).parent().css('position')!='absolute') $(control).parent().attr('posicionamiento',$(control).parent().css('position')).css('position','relative');
		$(control).parent().append('<div id="carg_'+$(control).attr('id')+'" class="cargando" style="position:absolute"></div>');
		var posicion = $(control).position();			
		
		$('#carg_'+$(control).attr('id')).css({
			'width': $(control).outerWidth(),
			'height': $(control).outerHeight(),
			'top': posicion.top+parseInt($(control).css('margin-top')),
			'left': posicion.left+parseInt($(control).css('margin-left'))
		});
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Es el callback por defecto. Notifica de los campos con errores si los hay, o avisa que todo ha sido realizado correctamente
////////////////////////////////////////////////////////////////////////////////////////////////////
function callback_formulario(formulario,datos,callback){	
	if (datos!=null){
		if(!datos.correcto)	{
			//Oculto el cargando
			cargando($(formulario),false);

			//Muestro los errores
			if (datos.campos!=undefined) mostrar_errores(formulario,datos.campos);
			else mostrar_errores(formulario,new Array());

			//Muestro el mensaje si lo hay
			if (datos.mensaje!=undefined) {
				$(formulario).find('.mensaje').addClass('alert').removeClass('alert-success').addClass('alert-danger').html(datos.mensaje).fadeIn();
				if ($(formulario).find('.mensaje').hasClass('autoocultar')) setTimeout(function(){$(formulario).find('.mensaje').fadeOut();},3000);
				if ($(formulario).find('.mensaje').length==0) mostrar_notificacion(datos.mensaje,'danger');
			}			

		}else{
			//Actualizo el codigo
			$(formulario).find('[name=codigo]').val(datos.codigo);
		
			//Miro a ver si tengo que mostrar un mensaje
			if (datos.mensaje!=undefined) {
				$(formulario).find('.mensaje').addClass('alert').removeClass('alert-danger').addClass('alert-success').html(datos.mensaje).fadeIn();;
				if ($(formulario).find('.mensaje').hasClass('autoocultar')) setTimeout(function(){$(formulario).find('.mensaje').fadeOut();},3000);
				if ($(formulario).find('.mensaje').length==0) mostrar_notificacion(datos.mensaje,'success');				
			}
			else $(formulario).find('.mensaje').removeClass('alert').removeClass('alert-danger').html('');
			
			//Oculto los errores
			mostrar_errores(formulario,new Array())

			//Oculto los botones que están marcados a ocultar sin cambios
			$(formulario).find('.ocultar_sin_cambios').hide();			
			
			//Miro a ver si tengo marcado un destino para recargarlo o cargar una url diferente			
			if (datos.url != undefined){
				if ($(formulario).attr('data-destino') != undefined) cargar_contenido(datos.url,$(formulario).attr('data-destino'),$(formulario).attr('data-dialogo'),callback);
				else window.location=datos.url;
			}

			//Miro a ver si tengo que actualizar algun div
			if ($(formulario).attr('data-recarga') != undefined) {
				if($(formulario).attr('data-recarga')=='documento') location.reload();
				else{
					var cont_rec=$(formulario).attr('data-recarga').split(";");
					$.each(cont_rec,function(ind,val){
						if ($('#'+val).attr('data-url')!=undefined) cargar_contenido($('#'+val).attr('data-url'),val);
						else $('#'+val).submit();																					
					});
				}
			}

			//Miro a ver si hay que ejecutar una función
			if ($(formulario).attr('data-correcto')!=undefined) eval($(formulario).attr('data-correcto')).apply(formulario,[datos]);

			//Miro a ver si tengo que vaciar el formulario
			if ($(formulario).attr('data-vaciar')!=undefined) $(formulario).find('input[type!=submit],textarea,select').val('');
			
			//Oculto el cargando
			cargando($(formulario),false);
		}		
	}
}


//////////////////////////////////////////////////////////////////////////////
// Dados los campos de un formulario los marca como campos erroneos
//////////////////////////////////////////////////////////////////////////////
function mostrar_errores(formulario,campos){
	//Borramos los errores de todos los campos
	$(formulario).find('input, select, textarea, .g-recaptcha').parents('.form-group,.btn-group,.input-group,.checkbox').removeClass('has-error');
	
	//Añadimos errores a los campos con error
	$.each(campos,function(ind,obj){
		$(formulario).find("input[name='"+obj+"']"+", select[name='"+obj+"'], textarea[name='"+obj+"'], .g-recaptcha[name='"+obj+"']").closest('.form-group,.btn-group,.input-group,.checkbox').addClass('has-error');
	});

	$(formulario).find(".has-error:first input,.has-error:first select,.has-error:first textarea").focus();

	//independientemente recargo el captcha		
	if($("[name='g-recaptcha']").length>0) grecaptcha.reset();

}

//////////////////////////////////////////////////////////////////////////////
// Muestra una notificación
//////////////////////////////////////////////////////////////////////////////
function mostrar_notificacion(texto,tipo){
	if(texto!=''){
		if($('#notificaciones').length==0) $('body').prepend("<div id='notificaciones' class='notifications top'></div>");
		$('#notificaciones').notify({message:{text:texto},type:tipo}).show();
	}
}

//////////////////////////////////////////////////////////////////////////////
// Inicializar los campos file
//////////////////////////////////////////////////////////////////////////////
function inicializar_subcontroles_files(id_contenedor){
	//Recorro todos los campo file para crear el iframe en sus formularios para el envio
	$('#'+id_contenedor+' input[type="file"]').each(function(ind,obj){
		var form=$(obj).parents('form');
		
		//Si no tiene target y es de tipo json genero el iframe
		if($(form).attr('target')==undefined && $(form).attr('tipo')=='json'){
			
			if ($(form).attr('id')==undefined) alert('Coloca un id a todos los formularios.')
			$(form).parent().append('<iframe style="display:none" id="'+$(form).attr('id')+'_iframe" name="'+$(form).attr('id')+'_iframe"></iframe>')
 	      	$(form).attr({'enctype':'multipart/form-data','target':$(form).attr('id')+'_iframe'});
 	      	
			$('iframe#'+$(form).attr('id')+'_iframe').load(function(){
				if($(this).contents().text()!=''){
		    		datos = jQuery.parseJSON($(this).contents().text());

					//Si el formulario tiene callback lo ejecutamos, sino ejecutamos el callback por defecto 
					if ($(form).attr('callback')!=undefined) eval($(form).attr('callback')).apply(form,[datos]);
					else callback_formulario(form, datos);		  
					
					cargando($(form),false);
				}
		    });
			
		}
	});	
}

//////////////////////////////////////////////////////////////////////////////
// Inicializar los subcontroles del control
//////////////////////////////////////////////////////////////////////////////
function inicializar_subcontroles(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';
	
	//Posicionar subcontroles
	posicionar_controles(id_contenedor);
		
	//Oculto los botones que no se tienen que mostrar si no hay cambios
	$(contenedor+" .ocultar_sin_cambios").hide();

	//Inicializar los subcontroles numericos
	$(contenedor+' [data-tipo="entero"]').forzarEnteros();

	//Inicializar los subcontroles decimales
	$(contenedor+' [data-tipo="decimal"]').forzarDecimales();
		
	//Inicializo los controles 
	inicializar_imagenes(id_contenedor);
	inicializar_ficheros(id_contenedor);
	inicializar_editores(id_contenedor);
	inicializar_fechas(id_contenedor);
	inicializar_tags(id_contenedor);
	inicializar_arboles(id_contenedor);
	inicializar_ordenacion(id_contenedor);
	inicializar_desplegables(id_contenedor);
	inicializar_tabs(id_contenedor);
	inicializar_movimiento(id_contenedor);
	inicializar_enlaces(id_contenedor);
	inicializar_mascaras(id_contenedor);
	inicializar_svgs(id_contenedor);
	inicializar_colorselector(id_contenedor);
	inicializar_onoff(id_contenedor);
	inicializar_multiselect(id_contenedor);
	inicializar_slider(id_contenedor);
	inicializar_tooltips(id_contenedor);
	inicializar_galerias(id_contenedor);
	inicializar_ratings(id_contenedor);

	//Redimensiona y posiciona los subcontroles
	redimensionar_controles(id_contenedor);

	//Inicializo los controles file (SOLO PARA INTERNET EXPLORER)
	if(typeof FormData == 'undefined') inicializar_subcontroles_files(id_contenedor);

	//Cargo las capas con data-cargar
	$(contenedor+" [data-cargar]").each(function(ind,obj){
		if($(obj).attr('data-cargar')=='1') enviar_formulario(this);
		else cargar_contenido($(obj).attr('data-cargar'),$(obj).attr('id'));
	});	
}




//////////////////////////////////////////////////////////////////////////////
// Iniciaciza los enlaces
//////////////////////////////////////////////////////////////////////////////
function inicializar_links(){

	// Hacer que los links del contenido se carguen en el contenido
	$(document).on('click','a, [click]',function(e){
		if ($(this).attr('target')==undefined && $(this).attr('href')!=undefined){

			//Si he clicado sobre un objeto que tiene un a como padre paro la propagación
			if($(this).parents('a').length>0) e.stopImmediatePropagation();	

			var ejecutar=true;
			
			//Si está deshabilitado no hago nada
			if ($(this).hasClass('disabled'))
				e.preventDefault();
			else{

				//Deshabilito el link
				$(this).attr('disabled','disabled');

				//Miro a ver si hay que ralizar un preproceso antes de realizar el link
				if ($(this).attr('data-preproceso') != undefined) ejecutar = eval($(this).attr('data-preproceso'));

				//Miro a ver si puedo ejecutar el link
				if (ejecutar) {

					//Si tiene destino o callback
					if ($(this).attr('data-destino') != undefined || ($(this).attr('data-retorno') != undefined || $(this).attr('data-recarga'))) {
						e.preventDefault();
												
						//Miro a ver si el link se tiene que ejecutar como action de un form
						if($(this).attr('data-form') != undefined){
							var formulario=$("#"+$(this).attr('data-form'));
							$(formulario).attr('action',$(this).attr('href'));
							if($(this).attr('data-tipo')!=undefined) $(formulario).attr('data-tipo',$(this).attr('data-tipo'));
							if($(this).attr('data-destino')!=undefined) $(formulario).attr('data-destino',$(this).attr('data-destino'));
							if($(this).attr('data-retorno')!=undefined) $(formulario).attr('data-retorno',$(this).attr('data-retorno'));
							if($(this).attr('data-recarga')!=undefined) $(formulario).attr('data-recarga',$(this).attr('data-recarga'));
							if($(this).attr('data-correcto')!=undefined) $(formulario).attr('data-correcto',$(this).attr('data-correcto')); else $(formulario).removeAttr('data-correcto');
							if($(this).attr('target')!=undefined) $(formulario).attr('data-target',$(this).attr('target'));

							if($(formulario).attr('data-tipo')!=undefined) enviar_formulario(formulario); 
							else $(formulario).submit(); 
							//habilito de nuevo el link
							$(this).removeAttr('disabled');
						}
						
						else{
						
							//Miro a ver si tiene que ejecutar un callback	
							if ($(this).attr('data-retorno') == undefined && $(this).attr('data-recarga') == undefined && ($(this).attr('data-tipo') == undefined || $(this).attr('data-tipo') == 'HTML')) {
								if ($(this).attr('href') != '#' && $(this).attr('href') != '') {
									var link = this;
									cargar_contenido($(this).attr('href'),$(this).attr('data-destino'),$(this).attr('data-dialogo'),function(){
										//habilito de nuevo el link
										$(link).removeAttr('disabled');
										if($(link).attr("data-recarga-form")!=undefined) $('#'+$(link).attr('data-destino')).find('form:first-child').attr('data-recarga',$(link).attr("data-recarga-form"));
										if($(link).attr("data-retorno-form")!=undefined) $('#'+$(link).attr('data-destino')).find('form:first-child').attr('data-retorno',$(link).attr("data-retorno-form"));	
										if($(link).attr("data-correcto-form")!=undefined) $('#'+$(link).attr('data-destino')).find('form:first-child').attr('data-correcto',$(link).attr("data-correcto-form"));										
									});																			
								}
							}
							else {
								var link = this;
								$.ajax({url: $(this).attr('href'), dataType: "json", type: "POST", cache: false,
									success: function(datos){
										//habilito de nuevo el link
										$(link).removeAttr('disabled');
										
										if (datos != null && datos.correcto == true) {
											//Miro a ver si tengo que actualizar algun div
											if ($(link).attr('data-recarga') != undefined) {
												if($(link).attr('data-recarga')=='documento') location.reload();
												else{
													var cont_rec=$(link).attr('data-recarga').split(";");
													$.each(cont_rec,function(ind,val){
														if ($('#'+val).attr('data-url')!=undefined) cargar_contenido($('#'+val).attr('data-url'),val);
														else $('#'+val).submit();																					
													});													
												}
											}
											//Miro a ver si tiene funcion de correcto
											if ($(link).attr('data-correcto') != undefined ) eval($(link).attr('data-correcto')).apply(link, [datos]);										 
											
											//Miro a ver si ha indicado un destino
											if ($(link).attr('data-destino') != undefined ){
												if($(link).attr('data-destino')=='documento') location.href=datos.url;
												else cargar_contenido(datos.url,$(link).attr('data-destino'),$(link).attr('data-dialogo'));
											} 

										}
										//Miro a ver si tengo que ejecutar alguna función de callback
										if ($(link).attr('data-retorno') != undefined) eval($(link).attr('data-retorno')).apply(link, [datos]);

										//Miro a ver si tengo que mostrar un mensaje
										if (datos.mensaje!=undefined) mostrar_notificacion(datos.mensaje,(datos.correcto?'success':'danger'));									
									}
								});
							}
						
						}
												
					}
					else{ 
						//habilito de nuevo el link
						$(this).removeAttr('disabled');

						if ($(this).attr('href')=='submit'){e.preventDefault(); $(this).parents('form').submit();}
						/*else{if($(this).attr('href') != undefined && $(this).attr('href') !='#') document.location=$(this).attr('href');}*/
					}
				}else{
					//habilito de nuevo el link
					$(this).removeAttr('disabled');
					e.preventDefault();
				}
			}			
		}		
	});
}

//////////////////////////////////////////////////////////////////////////////
// Tratar envio de formulario 
//////////////////////////////////////////////////////////////////////////////
function enviar_formulario(formulario){
	var ejecutar = true;
	var datos_form;
	var par_contentType;
	var par_processData;

	if(typeof FormData != 'undefined'){
		datos_form = new FormData($(formulario).get(0));	
		par_contentType = false;		
		par_processData = false;	
	}
	else{
		datos_form = $(formulario).serialize();	
		par_contentType = 'application/x-www-form-urlencoded; charset=UTF-8';		
		par_processData = true;			
	}

	//Miro a ver si hay que ralizar un preproceso antes 
	if ($(formulario).attr('data-preproceso') != undefined) ejecutar = eval($(formulario).attr('data-preproceso'));
	
	if (ejecutar){	

		cargando(formulario,true);

		$.ajax({
			url: $(formulario).attr('action'), dataType: $(formulario).attr('data-tipo'),type: $(formulario).attr('method'),
			data: datos_form, cache: false,	contentType: par_contentType,processData: par_processData, error: function() {},
			success: function(datos){	
				//Miro el tipo de resultado
				switch($(formulario).attr('data-tipo')){
					case 'html':
			    		if ($(formulario).attr('data-destino')!=undefined || $(formulario).attr('data-dialogo')!=undefined) {
			    			if($(formulario).attr('data-destino').toLowerCase().substr(0,7)=="dialogo") {							
								$("#"+$(formulario).attr('data-destino')).remove();
								$("body").append("<div id='"+$(formulario).attr('data-destino')+"' style='display:none;'/>");
								$('#'+$(formulario).attr('data-destino')).html(datos);														
								abrir_dialogo.apply($('#'+$(formulario).attr('data-destino')),[$(formulario).attr('data-dialogo')]);		    		
							}
							else{	
			    				$('#'+$(formulario).attr('data-destino')).html(datos);
			    				$('#'+$(formulario).attr('data-destino')).attr("url",$(formulario).attr('action')+'?'+datos_form);
			    			}
			    		}
						else alert ("Falta indicar el id del Div destino");
						cargando(formulario,false);  				
						break;
					case 'json':
						//Si el formulario tiene callback lo ejecutamos, sino ejecutamos el callback por defecto 
			    		if ($(formulario).attr('data-retorno')!=undefined) eval($(formulario).attr('data-retorno')).apply(formulario,[datos]);
			    		else callback_formulario(formulario, datos);		  
						break;
					default:
						$(formulario).attr('target','_self');
						$(formulario).submit();
						cargando(formulario,false);
				}				

		    }
	    });				
		
	}

}

//////////////////////////////////////////////////////////////////////////////
// Iniciaciza los formularios
//////////////////////////////////////////////////////////////////////////////
function inicializar_forms(){

	// Hacer que al hacer submit de un formulario cargue el efecto y llame al callback	
	$(document).on('submit','form',function(e){

		//si NO tiene target hacerlo por ajax
		if ($(this).attr('data-tipo')!=undefined) {
			e.preventDefault();		
			enviar_formulario(this);
		}
		else e.result;
		
	});
	
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo el movimiento de arrastras y soltar
//////////////////////////////////////////////////////////////////////////////
function inicializar_movimiento(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Dragable
	if($(contenedor+" [data-mover-tipo]").length>0) $(contenedor+" [data-mover-tipo]").draggable({cursor:'default',helper:'clone',revert:"invalid"});

	//dropable
	$(contenedor+" [data-mover-contenedor]").each(function(ind,obj){
		$(obj).droppable({
			accept: "[data-mover-tipo='"+$(obj).attr('data-mover-contenedor')+"']",
			drop: function( event, ui ) {
				var a=this;
				$.ajax({url: ui.draggable.attr('data-mover-url')+'/'+$(a).attr('data-codigo'), dataType: "json", type: "POST", cache: false,success:function(datos){					
					if(ui.draggable.attr('data-recarga')!=undefined){cargar_contenido($('#'+ui.draggable.attr('data-recarga')).attr('data-url'),undefined,ui.draggable.attr('data-recarga'));}
					if(ui.draggable.attr('data-retorno')!=undefined) eval(ui.draggable.attr('data-retorno')).apply(obj, [datos]);
				}});							
			}
		});
	});
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los desplegables
//////////////////////////////////////////////////////////////////////////////
function inicializar_desplegables(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	$(contenedor+" [data-desplegar]").each(function(ind,obj){
		$(this).click(function(e){e.preventDefault();$('#'+$(this).attr('data-desplegar')).slideToggle();})
	});

}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los multiselect
//////////////////////////////////////////////////////////////////////////////
function inicializar_multiselect(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	$(contenedor+" [data-tipo='multiselect']").each(function(ind,obj){
		$(this).multiselect({
			allSelectedText: $(obj).attr('data-eti-todos'),
			nSelectedText: $(obj).attr('data-eti-seleccionados'),
			enableFiltering: ($(obj).attr('data-buscador')!=undefined),
			filterPlaceholder: $(obj).attr('data-buscador'),
      		numberDisplayed: $(obj).attr('data-mostrar'),
      		maxHeight: $(obj).attr('data-altura'),
      		includeSelectAllOption: ($(obj).attr('data-sel-todos')!=undefined),
      		selectAllText: $(obj).attr('data-sel-todos')
    	});
	});

}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los colorpicker
//////////////////////////////////////////////////////////////////////////////
function inicializar_colorselector(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	$(contenedor+" [data-tipo='color']").colorselector();

}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los tipos sino
//////////////////////////////////////////////////////////////////////////////
function inicializar_onoff(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';
	
	$(contenedor+" [data-tipo='onoff']").each(function(ind,obj){
		var objValor=$('<input type="hidden" name="'+$(this).attr('name')+'" value="'+($(this).is(':checked')?1:0)+'">');
		$(this).before(objValor);
		$(this).removeAttr('name').bootstrapSwitch().on('switchChange.bootstrapSwitch',function(event, state){
			$(objValor).val((state?1:0)).trigger("change");
		});
	});

}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los tipos sino
//////////////////////////////////////////////////////////////////////////////
function inicializar_slider(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';
	
	$(contenedor+" [data-tipo='slider']").each(function(ind,obj){
		$(obj).wrap("<div class='slider-container'></div>");
		setTimeout(function(){$(obj).slider();},200);		
	});

}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los tooltips
//////////////////////////////////////////////////////////////////////////////
function inicializar_tooltips(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';	
	$(contenedor+' [data-toggle="tooltip"]').tooltip();		
}


//////////////////////////////////////////////////////////////////////////////
// Iniciacizo los controles de valoración
//////////////////////////////////////////////////////////////////////////////
function inicializar_ratings(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';	
	$(contenedor+' [data-tipo="rating"]').rating();		
}



//////////////////////////////////////////////////////////////////////////////
// Iniciacizo las galerias
//////////////////////////////////////////////////////////////////////////////
function inicializar_galerias(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';	
	$(contenedor+' [data-tipo="galeria"]').each(function(ind,obj){
		if($(this).find("img").length>1){
			$(this).hover(function(){
				if($(this).attr('data-indice')==undefined){
					$(this).attr({'data-activo':1,'data-indice':1});
					cambiar_img_gal(this);
				}
			},function(){
				$(this).attr("data-activo",0);
				$(this).find("img").hide().eq(0).show();
			});
			$(this).find("img").hide().eq(0).show();
		}
	});		
}
function cambiar_img_gal(obj){
	var ind=$(obj).attr('data-indice');

	if($(obj).attr('data-activo')==1){
		$(obj).find("img").hide().eq(ind).show();
		ind++;
		if(ind>=$(obj).find('img').length) ind=0;
		$(obj).attr('data-indice',ind);
		setTimeout(function(){cambiar_img_gal(obj)},1000);
	}else{$(obj).removeAttr('data-indice');}
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizo la ordenación
//////////////////////////////////////////////////////////////////////////////
function inicializar_ordenacion(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Convierto en ordenables las etiquetas con parametro mover	
	$(contenedor+" [data-ordenar-url][data-ordenar-grupo]").each(function(ind,obj){
		$(obj).sortable({cursor:'default',helper:'clone',handle:$(obj).attr('data-ordenar-tirador'),axis: $(obj).attr('data-ordenar-eje'),items:'[data-ordenar-grupo="'+$(obj).attr('data-ordenar-grupo')+'"]',update: function (e,ui){
			if($(obj).attr('data-ordenar-url')!='#') 
				$.ajax({
					dataType: "json", type: "POST", cache: false,
					url: $(obj).attr('data-ordenar-url')+'/'+$(ui.item).attr('data-codigo')+'/'+($(ui.item).prevAll('[data-ordenar-grupo="'+$(ui.item).attr('data-ordenar-grupo')+'"]').length+1), 
					success:function(datos){
						if($(obj).attr('data-retorno') != undefined) eval($(obj).attr('data-retorno')).apply(obj, [datos]);
					}
				});
		}});
	});
}

function inicializar_svgs(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

    if (typeof Modernizr != 'undefined' && !Modernizr.svg) {
    	$(document).ready(function(){
	        $('.svg').svgmagic();
	    });
    	/*
	    var imgs = document.getElementsByTagName('img');
	    var svgExtension = /.*\.svg$/
	    var l = imgs.length;
	    for(var i = 0; i < l; i++) {
	        if(imgs[i].src.match(svgExtension)) {
	            imgs[i].src = imgs[i].src.slice(0, -3) + 'png';
	        }
	    }
	    */
	}else{
	    $(contenedor+' img.svg').each(function(){
	        var $img = jQuery(this);
	        var imgID = $img.attr('id');
	        var imgClass = $img.attr('class');
	        var imgURL = $img.attr('src');

			$.ajax({url:imgURL, dataType: "xml", cache: true,success:function(data){					
				// Get the SVG tag, ignore the rest
	            var $svg = jQuery(data).find('svg');

	            // Add replaced image's ID to the new SVG
	            if(typeof imgID !== 'undefined') $svg = $svg.attr('id', imgID);

	            // Add replaced image's classes to the new SVG
	            if(typeof imgClass !== 'undefined') $svg = $svg.attr('class', imgClass+' replaced-svg');

	            // Remove any invalid XML tags as per http://validator.w3.org
	            $svg = $svg.removeAttr('xmlns:a');

	            // Replace image with new SVG
	            $img.replaceWith($svg);
			}});

	    });
	}
}
//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de tabs
//////////////////////////////////////////////////////////////////////////////
function inicializar_tabs(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Tab de bootstrap
	$(contenedor+' .nav-tabs a').click(function(e){
		if($(this).attr('href').substring(0,1)=='#'){
			e.preventDefault();
			$(this).tab('show');
		}
	});

	$(contenedor+' .nav-tabs a.active').tab('show');
}


//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de tipo árbol
//////////////////////////////////////////////////////////////////////////////
function inicializar_arboles(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Árbol (jsTee)
    $(contenedor+" [data-arbol-url]").each(function(ind,obj){
    	$(obj).on('move_node.jstree',function(e,data){
				$.ajax({url: $(obj).attr('data-mover-url')+'/'+data.node.id+'/'+data.parent+'/'+data.position, dataType: "json", type: "POST", cache: false,success:function(datos){					
					refrescar_drop_nodo(obj);
				}});				
			}).on('set_state.jstree',function(e,data){
				$(obj).find('a.jstree-clicked').click(); //Al cargar el árbol clico el nodo que estába marcado
				refrescar_drop_nodo(obj);
			}).on('load_node.jstree',function(e,data){
				refrescar_drop_nodo(obj);
    		}).on('create_node.jstree',function(e,data){
				refrescar_drop_nodo(obj);
    		}).on('select_node.jstree',function(e,data){
    			if ($(obj).attr('data-arbol-pulsar')!=undefined) eval($(obj).attr('data-arbol-pulsar'));
    		}).jstree({
				"core" : {"multiple" : false,"animation" : 0,"check_callback":true,'data':{'url' : $(obj).attr('data-arbol-url'),'data' : function (node) {return {'id':node.id};}}},
			    "types" : {"#":{"max_children":1,"valid_children":["raiz"]},"raiz":{"valid_children":["carpeta","fichero"]},"carpeta" : {"valid_children":["carpeta","fichero"]},"fichero" : {"icon":"glyphicon glyphicon-file","valid_children" : []}},
			    "plugins" : ($(obj).attr('data-arbol-plugins')==undefined ? "" : $(obj).attr('data-arbol-plugins')).split(",")
			});
	});	
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de tipo tag
//////////////////////////////////////////////////////////////////////////////
function inicializar_tags(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

    $(contenedor+" [data-tipo='tags']").each(function(ind,obj){
		var input_tag=this;		
		var fun_class=undefined;
		var fun_value=undefined;
		var fun_text=undefined;

		if($(input_tag).attr('data-tags-add')=='0'){
			fun_class=function(item) {
				if(item.tipo) return 'label label-info tag'+item.tipo;
				else return 'label label-info';
			};
			fun_value=function(item) {return item.codigo;};
			fun_text=function(item) {return item.texto;};
		}

		$(this).tagsinput({
			tagClass: fun_class,
			itemValue: fun_value,
			itemText: fun_text,
			typeahead: {source: function(query) {
				if($(input_tag).attr('data-tags-src')!=undefined){
					datos=$.getJSON($(input_tag).attr('data-tags-src')+'/'+encodeURIComponent(query));
					return datos;
				} 
				else return [];
			}}
		});
		
		//Miro a ver si los valores están en json y tengo que cargarlos 
		try {
 		   	var valores=jQuery.parseJSON($(input_tag).val());
 		   	$.each(valores,function(){
				$(input_tag).tagsinput('add',this);
			});
		} catch (e) {}

	});
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de fecha
//////////////////////////////////////////////////////////////////////////////
function inicializar_fechas(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	$(contenedor+" [data-tipo='fecha']").each(function(){
		var obj=this;
		$(this).attr('placeholder',$(this).attr('data-fecha-formato')).mask($(this).attr('data-fecha-formato').replace(/d/gi,'9').replace(/m/gi,'9').replace(/y/gi,'9'));
		$(this).attr('maxlength',10).wrap('<div class="input-group fecha"></div>');
		$(this).addClass('form-control').parents('.input-group').append('<div class="input-group-addon" style="cursor:pointer;"><span class="glyphicon glyphicon-calendar"></span></div>');
		$(this).datepicker({format:$(this).attr('data-fecha-formato'),
							autoclose:true,
							weekStart:$(this).attr('data-fecha-inicio'),language:$(this).attr('data-idioma')}).off('focus').on('changeDate',function(e){								
								if($(this).val().replace(/_/gi,'')=='//' || $(this).val().replace(/_/gi,'').length==10){
									var e = jQuery.Event("keypress");
									e.which = 13;
									$(obj).trigger(e);
								}
							});
		$(this).next('.input-group-addon').click(function(e){$(obj).datepicker('show');});
		//Si tiene etiquela la añado
		if($(this).attr('data-etiqueta')!=undefined) $('<div class="input-group-addon">'+$(this).attr('data-etiqueta')+'</div>').insertBefore(this);
	});
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de editor
//////////////////////////////////////////////////////////////////////////////
function inicializar_editores(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Editor CKEditor
	$(contenedor+' [data-tipo="editor"]').each(function(){
		$(this).summernote({
			toolbar: [
    			['style', ['bold', 'italic', 'underline', 'clear']],
    			['font', ['strikethrough', 'superscript', 'subscript']],
    			['para', ['ul', 'ol', 'paragraph']],
    			['varios',['link','video','table','hr']]
  			],
  			lang:'es-ES',
  			dialogsInBody: true
		});
	});
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles fichero
//////////////////////////////////////////////////////////////////////////////
function inicializar_ficheros(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Inicializo los controles tipo fichero
    $(contenedor+" [data-tipo='fichero']").each(function(ind,obj){
    	var cont_btn=$('<div class="btn-group fichero"></div>');
    	var btn_sel=$('<button type="button" class="btn btn-default">'+$(this).attr("data-fichero-nombre")+'</button>').click(function(e){$(obj).click();});
    	var btn_fil=$('<button type="button" class="btn btn-default" style="display:none;"><span class="glyphicon glyphicon-file"></span</button>');
    	var btn_del=$('<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-remove"></span></button>');
    	var hid_del=$('<input type="hidden" name="'+$(obj).attr('name')+'_delete">');

    	$(cont_btn).append(btn_fil).append(btn_sel).append(btn_del)

    	//Oculto el control file y muestro el boton para seleccionar	
    	$(this).css('display','none').change(function(e){
    		if($(this).val()!=''){
    			$(btn_sel).html($(this).val());	
    			$(btn_del).show();
    		} 
    		else $(btn_del).click();
    	}).before(cont_btn).before(hid_del);		

    	//Si ya tiene valor muestro el link al fichero y el botón de borrar
    	if($(this).attr('data-fichero-src')!=undefined && $(this).attr('data-fichero-src')!=''){
    		$(btn_fil).attr('data-url',$(this).attr('data-fichero-src')).show();
    		$(btn_del).show();    		
    	}else{
    		$(btn_del).hide(); 
    	}

    	//Agrego el evento al botón de borrar el fichero
		$(btn_del).click(function(e){
			$(btn_sel).html($(obj).attr("data-fichero-nombre"));
			$(obj).val('');
			$(hid_del).val(1);
			$(btn_fil).hide();
			$(btn_del).hide();
		});

		$(btn_fil).click(function(e){window.open($(btn_fil).attr('data-url'));});

	});
}		

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles de enlace
//////////////////////////////////////////////////////////////////////////////
function inicializar_enlaces(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Inicializo los controles tipo fichero
    $(contenedor+" [data-tipo='enlace']").each(function(ind,obj){
    	var btn_lnk=$('<div style="cursor:pointer;" class="input-group-addon"><span class="glyphicon glyphicon-link"></span></div>');
    	$(this).addClass('form-control').wrap('<div class="input-group">').after(btn_lnk);
		$(btn_lnk).click(function(e){window.open($(obj).val());});
	});
}

//////////////////////////////////////////////////////////////////////////////
// Iniciacizar controles con máscara
//////////////////////////////////////////////////////////////////////////////
function inicializar_mascaras(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	//Inicializo los controles tipo fichero
    $(contenedor+" [data-mascara]").each(function(ind,obj){
    	$(this).mask($(this).attr('data-mascara'));
	});
}			


//////////////////////////////////////////////////////////////////////////////
// Iniciaciza los controles imagen
//////////////////////////////////////////////////////////////////////////////
function inicializar_imagenes(id_contenedor){
	var contenedor='';
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';

	$(contenedor+' [data-tipo=imagen]').each(function(ind,obj){
		var cont=$('<div class="imagen"></div>');
		var cont_prev=$('<img class="'+$(obj).attr('data-imagen-class')+'">');
		var cont_bto=$('<div class="on_hover" style="float:right;"></div>');
		var hid_prev=$('<input type="hidden" name="'+$(obj).attr('name')+'_delete" value="">');
		var bto_mod=$('<a href="#" class="btn btn-success btn-xs"><span class="glyphicon glyphicon-pencil"></span></a> ').click(function(e){e.preventDefault();$(obj).click();});
		var bto_eli=$('<a href="#" class="btn btn-danger btn-xs"><span class="glyphicon glyphicon-remove"></span></a>').click(function(e){
				e.preventDefault();
				$(hid_prev).val('1');
				$(obj).val('');
				if($(obj).attr('data-imagen-src-def')!=undefined) $(cont_prev).attr('src',$(obj).attr('data-imagen-src-def')).show();
				else $(cont_prev).hide().attr('src','');
				$(this).hide();
		});

		$(cont).append(cont_prev);
						
		//Agrego los botones de modificar y borrar
		$(cont_bto).append(bto_mod);
		$(cont_bto).append(bto_eli);
		$(cont).append(cont_bto);

		//Agrego el hiden que dira si la imagen se ha borrado
		$(cont).append(hid_prev);
		
		//Agrego el contenedor
		$(obj).css({width:0,height:0}).after(cont);

		if($(obj).attr('data-imagen-src')!=undefined && $(obj).attr('data-imagen-src')!='') {
			/*
			$(cont_prev).on("load", function(){
				//Miro a ver si hay que hacer el crop
				if($(obj).attr('data-crop')!=undefined) $(cont_prev).Jcrop({'aspectRatio':1});
			});
			*/
			$(cont_prev).attr('src',$(obj).attr('data-imagen-src')).show();			
		}
		else $(bto_eli).hide();

		$(obj).change(function(e){
			if($(this).val()!=''){
				//Cargo el preview de la imagen
	            var imagen = new FileReader();
	            imagen.onload = function (e) {
	            	$(cont_prev).attr('src',e.target.result).show();
					
					//Miro a ver si hay que hacer el crop
					/*
					if($(obj).attr('data-crop')!=undefined) {
						var jcrop_api;
						$(cont_prev).Jcrop({'aspectRatio':1},function(){jcrop_api = this;});
					}
					*/
	            }
	            imagen.readAsDataURL(this.files[0]);
				$(bto_eli).css({display:'inline-block'});
			}else $(bto_eli).click();
		});
	});
}		


//////////////////////////////////////////////////////////////////////////////
// Iniciaciza los controles
//////////////////////////////////////////////////////////////////////////////
function inicializar_controles(){
	// Aplicar estilo a cajas con foco
	$(document).on('focusin','input,textarea,select',function(e){$(this).addClass('focus');});
	$(document).on('focusout','input,textarea,select',function(e){$(this).removeClass('focus');});	
		 
	// Si hacemos click en un checkbox de tipo seltodos hacemos que todos los checkbox de la tabla queden marcados (y viceversa) 
	$(document).on('click','[data-sel-todos]', function(){
		var filtro='type="checkbox"';		
		filtro='data-sel-grupo="'+$(this).attr('data-sel-todos')+'"';
		if ($(this).prop('checked')==true) $(this).parents('table').find('tbody input['+filtro+']').each(function(obj,ind){$(this).prop('checked','true');$(this).change();});
		else $(this).parents('table').find('tbody input['+filtro+']').each(function(obj,ind){$(this).removeProp('checked');$(this).change();});		
	});
	$(document).on('change','td input[type="checkbox"][data-sel-grupo]',function(e){var chk=this;$(this).parents('tr').toggleClass('active',$(chk).prop('checked'));});

	//Si cambiamos algun campo mostrar los botones de 
	$(document).on('paste','input[type="text"],textarea',function(){$(this).parents('form').find('.ocultar_sin_cambios').show();});
	$(document).on('change','select,input[type="file"],input[type="text"],textarea',function(){$(this).parents('form').find('.ocultar_sin_cambios').show();});
	$(document).on('keypress','input,textarea',function(){$(this).parents('form').find('.ocultar_sin_cambios').show();});	
	$(document).on('change','input[type="checkbox"],input[type="radio"]',function(e){$(this).parents('form').find('.ocultar_sin_cambios').show();});	

	
	// Si el formulario es del tipo auto envio, cada vez que cambiemos algo se realizará el submit
	$(document).on('change','[data-autoenvio="1"] select:not([data-autoenvio="0"])',function(){$(this).parents('form').submit();});
	$(document).on('keypress','[data-autoenvio="1"] input:not([data-autoenvio="0"])',function(e){if (e.which == 13) {e.preventDefault();$(this).parents('form').submit();}});	
	$(document).on('change','[data-autoenvio="1"] input[type=hidden]:not([data-autoenvio="0"]),[data-autoenvio="1"] input[type="checkbox"]:not([data-autoenvio="0"]),[data-autoenvio="1"] input[type="radio"]:not([data-autoenvio="0"])',function(e){$(this).parents('form').submit();});	
	
	inicializar_subcontroles();
}

//////////////////////////////////////////////////////////////////////////////
// Función añadidida a jquery para números enteros
//////////////////////////////////////////////////////////////////////////////
jQuery.fn.forzarEnteros =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            return (
                key == 8 || 
                key == 9 ||
                key == 46 ||
                (key >= 37 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};
//////////////////////////////////////////////////////////////////////////////
// Función añadidida a jquery para sólo decimales
//////////////////////////////////////////////////////////////////////////////
jQuery.fn.forzarDecimales =
function()
{
    return this.each(function()
    {
        $(this).keydown(function(e)
        {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
            return (
                key == 8 || 
                key == 9 ||
                key == 46 ||                
                ($(this).val()!='' && $(this).val().indexOf(".")==-1 && $(this).val().indexOf(",")==-1 && (key == 110 || key == 190 || key == 188)) ||
                (key >= 37 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105));
        });
    });
};
//////////////////////////////////////////////////////////////////////////////
// Iniciaciza los controles
//////////////////////////////////////////////////////////////////////////////
function redimensionar_controles(id_contenedor){
	var contenedor='';
	
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';
	
	//Redimensiono las capas que tienen el parametro altura
	$(contenedor+' [data-altura]').each(function(i,o){
		var valores=$(o).attr('data-altura').replace('+',',').replace('-',',').split(',');
		var altura=$(o).attr('data-altura');
		$.each(valores,function(i,o){ if(isNaN(parseInt(o))) if(o=='window') altura=altura.replace(o,$(window).height()); else altura=altura.replace(o,$("#"+o).innerHeight());});
		$(o).css({'height' : eval(altura)-($(o).outerHeight()-$(o).innerHeight())-parseInt($(o).css("margin-top"))-parseInt($(o).css("margin-bottom"))});	
	});

	//Cargo los controles iscroll
	/*
	if($(contenedor+' .wrapper').length>0){
		$(contenedor+' .wrapper').jScroll("remove");
		setTimeout(function(){$(contenedor+' .wrapper').jScroll();},100);
	}
	*/

}

//////////////////////////////////////////////////////////////////////////////
// Mueve los controles de su ubicación actual a la de su contenedor
//////////////////////////////////////////////////////////////////////////////
function posicionar_controles(id_contenedor){
	var contenedor='';	
	if(id_contenedor!=undefined) contenedor='#'+id_contenedor+'';
	$(contenedor+' [data-contenedor]').each(function(i,o){
		$('#'+$(o).attr('data-contenedor')).html($(o).html());
		$(o).html('');
	});
}


//////////////////////////////////////////////////////////////////////////////
// Iniciacización
//////////////////////////////////////////////////////////////////////////////
$(document).ready(function() {
	$.ajaxSetup({cache:false});
	$(window).resize(function(){redimensionar_controles();});
	inicializar_controles();
	inicializar_links();
	inicializar_forms();
});


//////////////////////////////////////////////////////////////////////////////
// Soluciona el problema del editor con las ventanas modales
//////////////////////////////////////////////////////////////////////////////
$.fn.modal.Constructor.prototype.enforceFocus = function() {
	modal_this = this
  	$(document).on('focusin.modal', function (e) {
    	if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length 
    		&& !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select') 
    		&& !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
      			modal_this.$element.focus()
    		}
  	})
};

//////////////////////////////////////////////////////////////////////////////
// Soluciona el problema de las multiventanas
//////////////////////////////////////////////////////////////////////////////
$(document).on('show.bs.modal', '.modal', function () {
    if($(this).attr('mod_vis')==undefined){
    	var zIndex = 1040 + (10 * $('[mod_vis]').length);
    	$(this).attr('mod_vis','1');
    	$(this).css('z-index', zIndex);
    	setTimeout(function() {
        	$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    	}, 0);
    }
});
$(document).on('hidden.bs.modal', '.modal', function () {
	$(this).removeAttr('mod_vis');
    $('.modal:visible').length && $(document.body).addClass('modal-open');
});


//////////////////////////////////////////////////////////////////////////////
// Devuelve un id único
//////////////////////////////////////////////////////////////////////////////
function id_unico(longitud) {
    var charstoformid = '_0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    if (!longitud) {
        longitud = Math.floor(Math.random() * charstoformid.length);
    }
    var uniqid = '';
    for (var i = 0; i < longitud; i++) {
        uniqid += charstoformid[Math.floor(Math.random() * charstoformid.length)];
    }
    if(jQuery("#"+uniqid).length == 0)
        return uniqid;
    else
        return id_unico(20)
}


