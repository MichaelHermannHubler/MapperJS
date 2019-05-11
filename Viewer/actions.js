var projectKey;

function loadProject(){
    projectKey = $('#modal-Open-Project-code')[0].value;
    $('#modal-Open-Project').modal('hide');
    loadMap(projectKey, true);
}

$("#fileLoadForm").submit(function(e) {
    e.preventDefault();
});

$('#modal-Open-Project').modal('show');