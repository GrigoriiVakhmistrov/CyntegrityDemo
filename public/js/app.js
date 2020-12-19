$(document).ready(function () {
  //init socket.io for automatically update UI
  let getUserId = function() {
    let pairs = document.cookie.split(";");
    for (let i = 0; i < pairs.length; i++) {
      let pair = pairs[i].split("=");
      if (pair[0] === 'userId') {
        return pair[1].split('%22')[1];
      }
    }
  }
  let userId = getUserId()
  let socket = io();
  socket.on(userId, function(msg) {
    let $message = $(
      '<div class="fade show alert alert-info">\n' +
      '  <button class="close" type="button" data-dismiss="alert">×</button>' +
      'Pipeline <b>' + msg.name + '</b> finished\n' +
      '</div>');
    $('.messages').append($message);
  });

  let pathname = window.location.pathname
  if(pathname.includes('pipelines/')) {
    let isEdit = $('h1').text().includes('Edit');

    let pipeline = {};
    pipeline.name = $("#name").val()
    if (isEdit)
      pipeline.tasks = JSON.parse($('input[name="_tasks"]').attr('value'));
    else
      pipeline.tasks = [];

    let onClickToAddButton = function() {
      let taskId = $(this).siblings('input[name="_id"]').val();

      if (pipeline.tasks.indexOf(taskId) < 0) {
        pipeline.tasks.push(taskId)
        addTaskToPipeline(taskId)
      }
    }
    let onCLickToRemoveButton = function() {
      let taskId = $(this).siblings('input[name="_id"]').val()

      let index = pipeline.tasks.indexOf(taskId);
      if (index >= 0) {
        pipeline.tasks.splice(index, 1);

        let $addButton = $('.hided').filter('.' + taskId);
        $addButton.show();

        $addButton.removeClass(taskId)
        $addButton.removeClass('hided')


        $(this).parent().parent().remove();
      }
    }

    let addTaskToPipeline = function(taskId) {
      let addButton = $('input[value=' + taskId + ']').siblings('.btn-add');
      addButton.hide();

      let newElement = $(addButton).parent().parent().clone()
      newElement.addClass('task-in-pipeline')
      newElement.addClass(taskId)
      $('.tasks-in-pipeline').append(newElement)

      $(addButton).addClass(taskId)
      $(addButton).addClass('hided')

      let $removeButton = $('<button class="btn btn-primary btn-remove" type="button">Remove</button>');
      $removeButton.click(onCLickToRemoveButton);
      $('.' + taskId).children('div.text-right').append($removeButton)
    }

    pipeline.tasks.forEach(taskId => addTaskToPipeline(taskId));

    $(document).on('click', '.btn-add', onClickToAddButton);
    $(document).on('click', '.btn-remove', onCLickToRemoveButton);
    $(document).on('click', '#btn-save', function() {
      let token = $('input[name="_csrf"]').attr('value')
      $.ajaxSetup({
        beforeSend: function(xhr) {
          xhr.setRequestHeader('Csrf-Token', token);
        }
      });

      let type = isEdit ? 'put' : 'post';
      let url = '/pipelines'
      if (isEdit) {
        let pid = $('input[name="_pid"]').attr('value')
        url += '/' + pid;
      }

      $.ajax({
        url: url,
        type: type,
        dataType: 'json',
        data: pipeline
      })
      .done(function() {
        window.location.pathname = '/pipelines';
      })
      .fail(function (error) {
        if (error.status === 200 && error.statusText === 'OK')
          window.location.pathname = '/pipelines';
      })
    })
    $(document).on('input', '#name', function() {
      pipeline.name = $(this).val();
    })
    $(document).on('click', '#btn-calculate', function() {
      let taskId = window.location.pathname.split('/').pop()
      $.get('calculate/' + taskId).done(data => {
        let $message = $(
          '<div class="fade show alert alert-info">\n' +
          '  <button class="close" type="button" data-dismiss="alert">×</button>' +
          'Average time: ' + data.averageTime + ' seconds\n' +
          '</div>');
        $('.messages').append($message);
      })
    })
    $(document).on('click', '#btn-run', function() {
      let taskId = window.location.pathname.split('/').pop()
      $.get('run/' + taskId)
    })
  }
});
