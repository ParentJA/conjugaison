function Option(type, text) {
    this._type = type || Option.Type.DISTRACTOR;
    this._text = text || null;
}

Option.Type = {
    KEY: "key",
    DISTRACTOR: "distractor"
};

var fn = Option.prototype;

fn.get_type = function () {
    return this._type;
}

fn.set_type = function (value) {
    this._type = value;
}

fn.get_text = function () {
    return this._text;
}

fn.set_text = function (value) {
    this._text = value;
}

function Item(type, instructions, stimulus, stem) {
    this._type = type || Item.Type.SELECTED_RESPONSE;
    this._instructions = instructions || null;
    this._stimulus = stimulus || null;
    this._stem = stem || null;
    this._response = null;
    this._correct = false;
    this._score = 0;
    this._correct_response = null;
    this._num_options = 0;
    this._options = [];
}

Item.Type = {
    SELECTED_RESPONSE: "selected_response",
    CONSTRUCTED_RESPONSE: "constructed_response"
};

fn = Item.prototype;

fn.get_type = function () {
    return this._type;
}

fn.set_type = function (value) {
    this._type = value;
}

fn.get_instructions = function () {
    return this._instructions;
}

fn.set_instructions = function (value) {
    this._instructions = value;
}

fn.get_stimulus = function () {
    return this._stimulus;
}

fn.set_stimulus = function (value) {
    this._stimulus = value;
}

fn.get_stem = function () {
    return this._stem;
}

fn.set_stem = function (value) {
    this._stem = value;
}

fn.get_response = function () {
    return this._response;
}

fn.set_response = function (value) {
    this._response = value;
}

fn.is_correct = function () {
    return this._correct;
};

fn.set_correct = function (value) {
    this._correct = value;
};

fn.get_score = function () {
    return this._score;
};

fn.set_score = function (value) {
    this._score = value;
};

fn.get_correct_response = function () {
    if (this.is_empty()) {
        return this._correct_response;
    }

    var indices = [];

    for (var i = 0; i < this._num_options; i++) {
        if (this._options[i].get_type() == Option.Type.KEY) {
            indices.push(i);
        }
    }

    return indices;
};

fn.set_correct_response = function (value) {
    this._correct_response = value;
}

fn.add_option = function (value) {
    this._num_options++;
    this._options.push(value);
}

fn.remove_option = function (value) {
    var index = this._options.indexOf(value);

    if (index != -1) {
        this._num_options--;
        this._options.splice(index, 1);
    }
}

fn.option_at = function (index) {
    return this._options[index];
}

fn.num_options = function () {
    return this._num_options;
}

fn.is_empty = function () {
    return (this._num_options == 0);
}

fn.is_complete = function () {
    return (this._response != null);
}

fn.reset = function () {
    this._response = null;
    this._correct = false;
    this._score = 0;
};

function Assessment(name) {
    this._name = name || null;
    this._current_item = null;
    this._current_item_index = -1;
    this._num_items = 0;
    this._items = [];
}

Assessment.default_item = {
    type: Item.Type.SELECTED_RESPONSE,
    instructions: "",
    stimulus: "",
    stem: "",
    response: "",
    correct: "",
    score: "",
    options: []
};

Assessment.create_assessment = function (data) {
    var assessment = new Assessment(data["name"]);

    $.each(data["items"], function (index, item_data) {
        var item = new Item(
            item_data["type"],
            item_data["instructions"],
            item_data["stimulus"],
            item_data["stem"]
        );

        item.set_response(item_data["response"]);
        item.set_correct(item_data["correct"]);
        item.set_score(item_data["score"]);
        item.set_correct_response(item_data["correct_response"]);

        $.each(item_data["options"], function (index, option_data) {
            var option = new Option(
                option_data["type"],
                option_data["text"]
            );

            item.add_option(option);
        });

        assessment.add_item(item);
    });

    return assessment;
}

fn = Assessment.prototype;

fn.get_name = function () {
    return this._name;
}

fn.set_name = function (value) {
    this._name = value;
}

fn.num_correct = function () {
    var num_correct = 0;

    for (var i = 0; i < this._num_items; i++) {
        if (this._items[i].is_correct()) {
            num_correct++;
        }
    }

    return num_correct;
};

fn.score = function () {
    var score = 0;

    for (var i = 0; i < this._num_items; i++) {
        score += this._items[i].get_score();
    }

    return score;
};

fn.add_item = function (value) {
    this._num_items++;
    this._items.push(value);
}

fn.remove_items = function (value) {
    var index = this._items.indexOf(value);

    if (index != -1) {
        this._num_items--;
        this._items.splice(index, 1);
    }
}

fn.item_at = function (index) {
    var item = (index && !isNaN(index))
        ? this._items[index]
        : this._current_item;

    return item;
}

fn.num_items = function () {
    return this._num_items;
}

fn.is_empty = function () {
    return (this._num_items == 0);
}

fn.is_complete = function () {
    for (var i = 0; i < this._num_items; i++) {
        if (!this._items[i].is_complete()) {
            return false;
        }
    }

    return true;
}

fn.item_type = function (index) {
    return this.item_at().get_type();
}

fn.item_instructions = function (index) {
    return this.item_at().get_instructions();
}

fn.item_stimulus = function (index) {
    return this.item_at().get_stimulus();
}

fn.item_stem = function (index) {
    return this.item_at().get_stem();
}

fn.item_response = function (index) {
    return this.item_at().get_response();
}

fn.item_is_correct = function (index) {
    return this.item_at().is_correct();
}

fn.item_score = function (index) {
    return this.item_at().get_score();
}

fn.item_correct_response = function (index) {
    return this.item_at().get_correct_response();
}

fn.item_num_options = function (index) {
    return this.item_at().num_options();
}

fn.item_is_empty = function (index) {
    return this.item_at().is_empty();
}

fn.item_is_complete = function (index) {
    return this.item_at().is_complete();
}

fn.option_type = function (option_index, item_index) {
    var item = this.item_at(item_index);

    return item.option_at(option_index).get_type();
}

fn.option_text = function (option_index, item_index) {
    var item = this.item_at(item_index);

    return item.option_at(option_index).get_text();
}

fn.current_item_index = function () {
    return this._current_item_index;
}

fn.is_first_item = function () {
    return (this._current_item_index == 0);
}

fn.is_last_item = function () {
    return (this._current_item_index == this._num_items - 1);
}

fn.move_to_first_item = function () {
    return this.move_to_item_at(0);
}

fn.move_to_next_item = function () {
    if (this._current_item == null) {
        return this.move_to_first_item();
    }

    if (!this.is_last_item()) {
        this._current_item_index++;
        this._current_item = this._items[this._current_item_index];

        return true;
    }
    else {
        return false;
    }
}

fn.move_to_item_at = function (index) {
    if (this._num_items < index + 1) {
        return false;
    }

    this._current_item_index = index;
    this._current_item = this._items[this._current_item_index];

    return true;
}

fn.evaluate = function (response, item_index) {
    var item = (item_index && !isNaN(item_index))
        ? this._items[item_index]
        : this._current_item;

    console.log(item);

    var is_item_correct = false;

    var correct_response = item.get_correct_response();

    if (response.length == correct_response.length) {
        is_item_correct = true;

        for (var i = 0, num_indices = response.length; i < num_indices; i++) {
            if (correct_response.indexOf(response[i]) == -1) {
                is_item_correct = false;

                break;
            }
        }
    }

    if (is_item_correct) {
        item.set_response(response);
        item.set_correct(true);
        item.set_score(this.calculate_score());
    }
    else {
        item.set_response(response);
        item.set_correct(false);
        item.set_score(0);
    }

    return is_item_correct;
}

//TODO: This might eventually have multipliers, etc...
fn.calculate_score = function () {
    return 1;
}

fn.reset = function () {
    for (var i = 0; i < this._num_items; i++) {
        this._items[i].reset();
    }

    this._current_item = null;
    this._current_item_index = 0;

    this.move_to_first_item();
};