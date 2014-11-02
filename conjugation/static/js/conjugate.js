//--------------------------------------------------
// Constants
//--------------------------------------------------

var NUM_VERBS = 20;

//--------------------------------------------------
// Variables
//--------------------------------------------------

var csrftoken = null;
var is_user_authenticated = false;
var loading = true;
var loaded = false;
var updated = false;

//Quiz...
var quiz = null;

//Components...
var progress_bar = null;
var carousel = null;

//Modals...
var loading_modal = null;

//--------------------------------------------------
// Methods
//--------------------------------------------------

function reset() {
    var container = $("body").children(".container").empty();

    var wrapper = $([
        "<div class='row'>",
        "<div class='col-lg-offset-3 col-lg-6 col-md-offset-3 col-md-6'>",
        "</div>",
        "</div>"
    ].join("")).children().eq(0);

    progress_bar = create_progress_bar();
    progress_bar.appendTo(wrapper);

    carousel.find(".item").eq(0).addClass("active");
    carousel.appendTo(wrapper);

    container.append(wrapper.parent());
}

function create_progress_bar(id) {
    var progress_bar = $([
        "<div class='progress'>",
        "</div>"
    ].join(""));

    if (id) {
        progress_bar.attr("id", id);
    }

    return progress_bar;
}

function update_progress_bar(progress_bar, num_segments, total_segments, color_class) {
    var width = Math.floor((num_segments / total_segments) * 100);

    var segment = $("<div class='progress-bar'></div>");
    segment.addClass(color_class);
    segment.css("width", width + "%");

    progress_bar.append(segment);
}

function create_carousel(id) {
    var carousel = $([
        "<div class='carousel' data-interval='false'>",
        "<div class='carousel-inner'></div>",
        "</div>"
    ].join(""));

    if (id) {
        carousel.attr("id", id);
    }

    return carousel;
}

function create_slide(item) {
    var slide = $([
        "<div class='item'>",
        "<h1 class='stimulus-text'>",
        "<a href='#' data-toggle='tooltip' title='", item["instructions"], "'>", item["stimulus"], "</a>",
        "</h1>",
        "<div class='form-group'>",
        "<div class='input-group'>",
        "<span class='input-group-addon'>", item["stem"], "</span>",
        "<input class='form-control response-input' type='text' name='user-response'>",
        "</div>",
        "</div>",
        "<button class='btn btn-inverse check-button' type='button'>Check</button>",
        "<button class='btn btn-inverse next-button' type='button' style='display:none;'>Next</button>",
        "</div>"
    ].join(""));

    return slide;
}

function create_alert(message, color_class) {
    var alert = $("<div class='alert'></div>");
    alert.addClass(color_class);
    alert.html(message);

    return alert;
}

function update_quiz() {
    var slide = carousel.find(".item.active");
    var input = slide.find(".response-input");
    var input_value = input.val();

    if (has_valid_input()) {
        quiz.evaluate([input_value]);

        //var body_color_class = "";
        var input_color_class = "has-success";
        var icon = $("<span class='input-icon'></span>");
        var icon_class = "fui-check";
        //var alert_message = "";
        //var alert_color_class = "";
        var progress_bar_color_class = "progress-bar-success";

        if (quiz.item_is_correct()) {
            
        }
        else {
            //body_color_class = "success-background";
            input_color_class = "has-error";
            icon_class = "fui-cross";
            //alert_message = "";
            //alert_color_class = "";
            progress_bar_color_class = "progress-bar-danger";
        }

        //Update body background change...
        //$("body").removeAttr("class").addClass(body_color_class);

        //Update input...
        slide.addClass(input_color_class);
        icon.addClass(icon_class).insertAfter(input);

        //Update alert...
        /*var alert = create_alert(alert_message, alert_color_class);

        $("body").children(".container").find(".row").last().children().eq(0).empty().append(alert);

        alert.fadeOut(1000, function () {
            alert.remove();
        });*/

        //Update score, multipliers...
        
        //Update progress bar...
        update_progress_bar(progress_bar, 1, NUM_VERBS, progress_bar_color_class);

        //Update progress...
        if (is_user_authenticated) {
            update_progress(quiz.item_stimulus(), quiz.item_stem(), quiz.item_is_correct());
        }

        slide.find(".check-button").hide().end().find(".next-button").show();
    }
}

function update_quiz_focus() {
    if (quiz.is_complete()) {
        var slide = carousel.find(".item.active");

        slide.find(".response-input").attr("disabled", "disabled");
        slide.find(".next-button").hide();

        loading = true;
        loaded = false;
        updated = false;

        $.getJSON("/verbs/" + NUM_VERBS + "/")
            .done(on_get_verbs_success)
            .fail(on_get_verbs_failure);

        var more_button = $([
            "<div class='form-group'>",
            "<button class='btn btn-inverse more-button' type='button'>Keep 'em coming</button>",
            "</div>"
        ].join(""));

        slide.append(more_button);

        var statistics_button = $([
            "<div class='form-group'>",
            "<button class='btn btn-inverse statistics-button' type='button'>View stats</button>",
            "</div>"
        ].join(""));

        slide.append(statistics_button);
    }
    else {
        //$("body").removeAttr("class").addClass("normal-background");

        if (quiz.move_to_next_item()) {
            $(this).hide();

            carousel.carousel("next");
        }
    }
}

function has_valid_input() {
    var input_value = carousel.find(".item.active").find(".response-input").val();

    return (input_value.length > 0);
}

function update_progress(infinitive, pronoun, correct) {
    if (updated == false) {
        $.post("/progress/", {
            csrfmiddlewaretoken: csrftoken,
            infinitive: infinitive,
            pronoun: pronoun,
            correct: correct
        });

        updated = true;
    }
}

//--------------------------------------------------
// Events
//--------------------------------------------------

function on_start_button_click(event) {
    if (!loaded) {
        loading = true;
        loading_modal.modal("show");

        return;
    }

    reset();
}

function on_response_input_keyup(event) {
    if (event.which == 13 && has_valid_input()) {
        var active_item = $("body").children(".container").find(".item.active");

        if (active_item.find(".check-button").is(":visible")) {
            update_quiz();
        }
        else {
            update_quiz_focus();
        }
    }
}

function on_check_button_click(event) {
    update_quiz();
}

function on_next_button_click(event) {
    update_quiz_focus();
}

function on_more_button_click(event) {
    if (!loaded) {
        loading = true;
        loading_modal.modal("show");

        return;
    }

    reset();
}

function on_statistics_button_click(event) {
    window.location.href = "/statistics/";
}

function on_carousel_slid(event) {
    updated = false;

    var item = carousel.find(".item.active");
    item.find(".response-input").focus();
    item.find(".check-button").show();
}

//--------------------------------------------------
// AJAX events
//--------------------------------------------------

/*function on_ajax_start(data) {
    if (!loaded) {
        loading = true;
        loading_modal.modal("show");
    }
}*/

function on_get_verbs_success(data) {
    loaded = true;

    quiz = Assessment.create_assessment(data);
    quiz.reset();

    carousel = create_carousel();
    carousel.on("slid.bs.carousel", on_carousel_slid);

    var carousel_inner = carousel.find(".carousel-inner");

    $.each(data["items"], function (index, value) {
        var slide = create_slide(value);

        carousel_inner.append(slide);
    });

    carousel_inner.find(".stimulus-text").find("a").tooltip({
        trigger: "hover",
        container: "body",
        placement: "top"
    });

    loading_modal.modal("hide");
    loading = false;

    $("#start-button").removeAttr("disabled");
}

function on_get_verbs_failure(data) {
    console.log("The call to get verbs failed!");
}

//--------------------------------------------------
// jQuery ready
//--------------------------------------------------

$(function () {
    csrftoken = $.cookie("csrftoken");

    loading_modal = $("#loading-modal");

    //$(document).ajaxStart(on_ajax_start);

    $.getJSON("/verbs/" + NUM_VERBS + "/")
        .done(on_get_verbs_success)
        .fail(on_get_verbs_failure);

    $("body")
        .on("click", "#start-button", on_start_button_click)
        .on("keyup", ".response-input", on_response_input_keyup)
        .on("click", ".check-button", on_check_button_click)
        .on("click", ".next-button", on_next_button_click)
        .on("click", ".more-button", on_more_button_click)
        .on("click", ".statistics-button", on_statistics_button_click);
});