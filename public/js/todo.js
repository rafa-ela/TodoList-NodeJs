$(document).ready(function (e) {

    loadAllTasks();


    $('#add-todo').button({
        icons: {
            primary: "ui-icon-circle-plus"
        }
    }).click(
        function () {
            $('#new-todo').dialog('open');
        });

    $('#new-todo').dialog({
        modal: true,
        autoOpen: false,
        buttons: {

            "Add task": function () {

                var taskName = $('#task').val();
                if (taskName === '') {
                    return false;
                }
                $.ajax({
                    method: 'POST',
                    url: 'https://floating-garden-64913.herokuapp.com/task_add',
                    data: JSON.stringify({
                        task: taskName
                    }),
                    contentType: "application/json",
                    dataType: "json",
                    success: function (row) {
                        var taskHTML;
                        taskHTML = '<li><span class="done">%</span>';
                        taskHTML += '<span class="edit">+</span>';
                        taskHTML += '<span class="delete">x</span>';
                        taskHTML += '<span class="task", id ="'+row.max+'">' + taskName+ '</span></li>';
                        taskHTML += '';
                        var $newTask = $(taskHTML); //$() function turns it into a DOM element
                        $newTask.find('.task').text(taskName); //find class and and add the content of taskName to span class 'task'
                        $newTask.hide();
                        $('#task').val('');
                        $('#todo-list').prepend($newTask); //add new task to todo-list
                        $newTask.show('clip', 250).effect('highlight', 1000);
                        $('#new-todo').dialog('close');

                    }
                })
            },

            "Cancel": function () {
                $(this).dialog('close');
            }

        },
        /*Clears the input text when the "x" button is pressed*/
        close: function () {
            $(':text', this).val('');
        }

    });



    /*Moves the todo task to the completed list*/
    $('#todo-list').on('click', '.done', function () {
        var doneTask = $(this).parent('li'); //stores the element the user clicked on
        var doneTaskName= doneTask.find('.task').text();
        var taskHTML;
        taskHTML = '<li><span class="done">%</span>';
        taskHTML += '<li><span class="edit">+</span>';
        taskHTML += '<span class="delete">x</span>';
        taskHTML += '<span class="task">' + doneTaskName + '</span></li>';
        var $renamedTask = $(taskHTML);
        var sibling = doneTask.find('.task').attr('id'); //finds the id of the clicked task
        var change = true;
        $.ajax({
            method: 'PUT',
            url: 'https://floating-garden-64913.herokuapp.com/task_done',
            data: JSON.stringify({
                done: change, id:sibling
            }),
            contentType: "application/json",
            success: function () {
                doneTask.slideUp(250, function () {
                    doneTask.detach();
                    $('#completed-list').prepend($(doneTask));
                    doneTask.slideDown();

                })
            }
        })
    });

    /*Allows drag and drops */
    $('.sortlist').sortable({
        connectWith: '.sortlist',
        cursor: 'pointer',
        placeholder: 'ui-state-highlight',
        cancel: '.delete,.done',
        stop:function(){
            updateTodo();
            updateCompleted();
        }
    });

    /*When the edit button is clicked, it gets
     and stores the task you want to delete and
     opens the edit-option dialog
     */
    var toBeDeleted;
    $('#todo-list').on('click', '.edit', function () { //allows any element with ID "to-do list" to be modified
        toBeDeleted = $(this).parent('li'); //saves the element you want to modify
       $('#edit-option').data({'task':this}).dialog('open');
      //  $('#edit-option').dialog('open');

    });

    $('#edit-option').dialog({
            autoOpen: false,
            modal: true,
            buttons: {
                "Cancel": function () {
                    $(this).dialog('close');
                },
                "Confirm": function () {

                    var editedTask = $('#editTask').val();
                    if (editedTask === '') {
                        return false;
                    }
                    var taskHTML;
                    taskHTML = '<li><span class="done">%</span>';
                    taskHTML += '<span class="edit">+</span>';
                    taskHTML += '<span class="delete">x</span>';
                    taskHTML += '<span class="task">' + editedTask + '</span></li>';
                    var $renamedTask = $(taskHTML);
                    var sibling = toBeDeleted.find('.task').attr('id');
                    $.ajax({
                        method: 'PUT',
                        url: 'https://floating-garden-64913.herokuapp.com/task_edit',
                        data: JSON.stringify({
                            id: sibling, task:editedTask
                        }),
                        contentType: "application/json",
                        success:function () {
                            $renamedTask.hide();
                            toBeDeleted.remove(); //remove the old task
                            $('#todo-list').prepend($renamedTask); //add a new task
                            $renamedTask.show('clip', 250).effect('highlight', 1000);
                            $('#edit-option').dialog('close');
                        }
                    });
                }
        }, /*Clears the text input */
        close: function () {
            $(':text', this).val('');
        }
    });

    /*When the delete button is clicked, it gets
     and stores the task you want to delete and
     opens a dialog
     */

    $('.sortlist').on('click', '.delete', function () {
      $('#delete-option').data({'task':this}).dialog('open');

    });
    /*Deletes a task from each list*/
    $('#delete-option').dialog({ //opens delete option dialog
        autoOpen: false,
        modal: true,
        buttons: {
            "Cancel": function () {
                $(this).dialog('close');
            },
            "Confirm": function () { //removes it from the list
                var taskDel = $(this).data('task');
                var id_task = $(taskDel).siblings('.task').attr('id');
                $.ajax({
                    method: 'DELETE',
                    url: 'https://floating-garden-64913.herokuapp.com/id_task',
                    data: JSON.stringify({
                        id: id_task
                    }),
                    contentType: "application/json",
                    success:function () {
                        $(taskDel).parent('li').effect('puff', function () {
                            $(taskDel).remove();
                        });
                        $('#delete-option').dialog('close');
                    }
                })

            }
        }
    });

}); // end ready

function loadAllTasks(){
    $.ajax({
        method: 'GET',
        url: 'https://floating-garden-64913.herokuapp.com/task_display',
        dataType: "json",
        success: function (data) {
            for(var i = 0; i< data.length; i++){
                var obj = data[i].done; //each object in the json file array
                var taskHTML;
                taskHTML = '<li><span class="done">%</span>';
                taskHTML += '<span class="edit">+</span>';
                taskHTML += '<span class="delete">x</span>';
                taskHTML += '<span class="task", id ="'+data[i].id+'">' + data[i].task + '</span></li>';
                taskHTML += '';

                if(obj == false){
                    $('#todo-list').prepend(taskHTML);
                }
                else{
                    $('#completed-list').prepend(taskHTML);
                }
            }
        }

    })
}

/**
 * This function makes an ajax call to the server
 * whenever the task on each list gets dragged and dropped
 */
function updateTodo(){
    var ul_todo = document.getElementById("todo-list");
    var todoList = ul_todo.getElementsByTagName("li");
    for (var i = 0; i < todoList.length; ++i) {
        var id = jQuery('span.task', todoList[i]).attr('id');
    $.ajax({
        method: 'PUT',
        url:'https://floating-garden-64913.herokuapp.com/task_updateTodoList',
        contentType: 'application/json',
        data: JSON.stringify({
            id_todo: id, boolVal:false
        })
    })
    }
}


function updateCompleted(){
    var ul_completed = document.getElementById("completed-list");
    var completedList = ul_completed.getElementsByTagName("li");
    for (var i = 0; i < completedList.length; ++i) {
        var id = jQuery('span.task', completedList[i]).attr('id');
        $.ajax({
            method: 'PUT',
            url:'https://floating-garden-64913.herokuapp.com/task_updateCompleteList',
            contentType: 'application/json',
            data: JSON.stringify({
                id_todo: id, boolVal:true
            })
        })
    }
}