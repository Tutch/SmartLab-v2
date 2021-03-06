var jsonLab = "./LaboratoryListService";
var jsonMaq = "./MachineListService";
var shutdownURL = "./ShutdownMachineService";

var memberIndex = 1;
var labsJson;
var maqsJson;
var currentLabId = -1;
var nLabs = 0;
var nMaqs = 0;




/* Essa função requisita a lista de laboratórios no Coordinator e
 * preenche um dropdown (select) com as máquinas disponíveis.
 */
$(document).ready(function() {   

    var descLab = "";

	$.ajax({
        url: jsonLab,
        type:'GET',
        dataType: 'json',
        success: function( json ) {
            console.log(json);
            $.each(json, function(i, lab) {
               $('#laboratorios').append($('<option>').text("Laboratório " + lab.id).attr('value', lab.id));
            });

            labsJson = json;
            nLabs = labsJson.length;
        }, 
        error: function(xhr, error){
            console.debug(xhr); console.debug(error);
        }
    });

});

/* Lista os dados do laboratório escolhido no dropdown e em seguida 
 * preenche uma div com as máquinas sendo monitoradas por aquele laboratório
 * e suas informações.
 */
function listarInfos(value){

    $('#labInfo').empty();
    $('#machinesInfo').empty();

    var currentLab = {};
    var luz;
    var users

    for(var i=0; i < nLabs; i++){
        if(labsJson[i].id === value){
            currentLab = labsJson[i];

            if(currentLab.light > 0){
                luz = "Ligadas"
            }else{
                luz = "Desligadas"
            }

            if(currentLab.presence === "Sim"){
                users = "Em Uso"
            }else{
                users = "Ninguém"
            }

            $('#labInfo').append($('<h3>').text("Laboratório " + value));
            $('#labInfo').append($('<ul>')
                .append($('<li>').append($('<span class="inline-icon fa fa-thermometer-half">')).append($('<span>').text(currentLab.temperature + "ºC")))
                .append($('<li>').append($('<span class="inline-icon fa fa-lightbulb-o">')).append($('<span>').text(luz)))
                .append($('<li>').append($('<span class="inline-icon fa fa-users">')).append($('<span>').text(users)))

            );
            $('#labInfo').append($('<button id="shutdownLab">Desligar Laboratório</button>'));

            currentLabId = labsJson[i].id;
        }
    }

    // Para cada máquina, gerar a sua caixa

    var counter = 0;
    var row = 0;
    var rootId;
    var OS;


    console.log(value);
    console.log('hey jude');

    $.ajax({
        url: jsonMaq,
        type:'GET',
        dataType: 'json',
        data:{ "laboratoryId":value},

        success: function( json ) {

            console.log(json);
            
            $.each(json, function(i, maq) {
                
                switch(maq.osType){
                    case '0':
                        OS = "Windows";
                    break;

                    case '1':
                        OS = "Linux";
                    break;

                    default:
                        OS = "Desconhecido";
                    break;
                }

                if(counter === 0){
                    rootId = "root" + row;
                    $('#machinesInfo').append($('<div class="section group" id=' + rootId + '>'));
                }

                var freeMem = parseInt(maq.freeMemory, 10)/Math.pow(1024,2);
                var freeMemString = freeMem.toString();

                var freeMemDisplay = freeMemString.substring(0,1) + '.' + freeMemString.substring(2,4) + 'GB';

                var totalMem = parseInt(maq.totalMemory, 10)/Math.pow(1024,3);
                var totalMemString = totalMem.toString();

                var totalMemDisplay = totalMemString.substring(0,1) + '.' + totalMemString.substring(2,4) + 'GB';

                $('#' + rootId).append($('<div class="col span_2_of_10">')
                    .append($('<div id="maq'+ maq.id +'"     class="maqGroup">')
                        .append($('<p>')
                            .append($('<span class="maqLabel">').text('IP: '))
                            .append($('<span>').text(maq.networkAddress))
                        )
                        .append($('<p>')
                            .append($('<span class="maqLabel">').text('Sistema: '))
                            .append($('<span>').text(OS))
                        )
                        .append($('<p>')
                            .append($('<span class="maqLabel">').text('Processos: '))
                            .append($('<span>').text(maq.runningProcesses))
                        )
                        .append($('<p>')
                            .append($('<span class="maqLabel">').text('Memória: '))
                            .append($('<span>').text( freeMemDisplay + " de " + totalMemDisplay) )
                        )
                        .append($('<button id="shutdownMaq" onclick="shutdown(' + value + "," + maq.id + ')">Desligar</button>'))
                    )
                );

                counter++;

                if(counter === 5){
                    counter = 0;
                    row++;
                }
                                
            });

            maqsJson = json;
            nMaqs = json.length;
        }
    });   

}

/* Desliga o laboratório (em implementação)
 */
$('#labInfo').on('click', '#shutdownLab', function(){

    if(currentLabId != -1){

        for(var i=0; i < nMaqs; i++){

            var maqId = maqsJson[i].id;

            console.log(currentLabId);
            console.log(maqId);

            shutdown(currentLabId, maqId);
        }
    }
});


// Desliga uma única máquina (em implementação)
function shutdown(labId, maqId){  

    $.ajax({
        url: shutdownURL,
        type:'POST',
        dataType: 'json',
        data:{ "laboratoryId":labId,"machineId":maqId},

        success: function( json ) {
            console.log(json);

            if(json.shutdown === "true"){
                var id = '#maq' + maqId;

                $(id).css('background','#eee');
                $(id).css('color','#aaa');
                $(id + ' #shutdownMaq').css('background-color','#aaa');
                $(id + ' #shutdownMaq').prop('disabled',true); 
                $(id + ' #shutdownMaq').text('Desligando');

            }

        }, 
        error: function(xhr, error){
            console.debug(xhr); console.debug(error);
        }
    });
}
