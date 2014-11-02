//--------------------------------------------------
// Variables
//--------------------------------------------------

var infinitives_graph = null;
var pronouns_graph = null;
var total_graph = null;

var tabs = null;
var infinitives_tab = null;
var pronouns_tab = null;
var total_tab = null;
var graph = null;

//--------------------------------------------------
// Methods
//--------------------------------------------------

function set_tab_active(tab) {
    tabs.removeAttr("class");

    tab.addClass("active");
}

function extract_infinitives_data(data) {

}

function extract_pronouns_data(data) {

}

function extract_total_data(data) {
    var total_data = 0;

    $.each(data, function (key, value) {
        $.each(value, function (key, value) {
            total_data += value;
        });
    });

    return total_data;
}

function display_infinitives_graph() {

}

function display_pronouns_graph() {

}

function display_total_graph() {
    if (total_graph == null) {
        total_positive_data = extract_total_data(this.positive_data);
        total_negative_data = extract_total_data(this.negative_data);

        var sum_total_data = total_positive_data + total_negative_data;
        var percent_positive_data = Math.ceil(100 * total_positive_data / sum_total_data);
        var percent_negative_data = Math.floor(100 * total_negative_data / sum_total_data);

        console.log(sum_total_data);

        total_graph = {
            chart: { type: "column" },
            colors: ["#2ECC71", "#E74C3C"],
            credits: { enabled: false },
            legend: { enabled: false },
            title: { text: null },
            subtitle: { text: null },
            xAxis: { categories: ["Conjugations"], gridLineColor: "#DDD" },
            yAxis: { labels: { format: '{value}%' }, min: 0, max: 100, allowDecimals: false, gridLineColor: "#DDD" },
            tooltip: { valueSuffix: "%" },
            series: [
                { name: "Correct", data: [percent_positive_data] },
                { name: "Incorrect", data: [percent_negative_data] }
            ]
        };
    }

    graph.highcharts(total_graph);
}

//--------------------------------------------------
// Events
//--------------------------------------------------

function on_infinitives_tab_click(event) {
    set_tab_active($(this));
}

function on_pronouns_tab_click(event) {
    set_tab_active($(this));
}

function on_total_tab_click(event) {
    set_tab_active($(this));
}

//--------------------------------------------------
// jQuery ready
//--------------------------------------------------

$(function () {
    tabs = $("ul.nav.nav-tabs").children();
    infinitives_tab = $("#infinitives-tab").on("click", on_infinitives_tab_click);
    pronouns_tab = $("#pronouns-tab").on("click", on_pronouns_tab_click);
    total_tab = $("#total-tab").on("click", on_total_tab_click);
    graph = $("#graph");

    set_tab_active(total_tab);
    display_total_graph();
});