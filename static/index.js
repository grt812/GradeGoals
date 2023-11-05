let categoryHTML = `
<div id="category-container">
        <div id="" class="category">
            <h1>Assignment</h1>
            <div class="d-flex">
                <div class="left-col">
                    <div class="score-container">
                        <div class="score">
                            <input class="" type="text" placeholder="Points Earned" size="14"> &nbsp;&nbsp;&nbsp;out of&nbsp; &nbsp;&nbsp;
                            <input  class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                            <button>Delete</button>
                        </div>
                    </div>
                    <div class="">
                        <button>Add Predicted+</button>
                        <button>Add Predicted Assignent+</button>
                    </div>
                </div>
                <div class="right-col">
                    Predict Category
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                    <input type="text" placeholder="Predicted Category %">
                </div>
            </div>
            <div>
                <button class="delete-category"><span class="material-symbols-outlined"> close </span></button>
            </div>
        </div>
    </div>
`;
//Dict
//dict of assignments,
    //in assignment: score, totalScore, (in "tuple")
//category needed (predictedCategory): true/false
    //if true: predicted category precentage


$(function(){
    let dictOfCategories = {};
    $("#add-category").click(function(){
        $(this).hide(500);
        $("#category-input").show(500);
        $("#category-input")[0].focus();
    });
    $("#category-input").keypress(function(e){
        let categoryValue = $("#category-input").val();
        if(e.keyCode == 13 && $("#category-input").val().length >=2 && !dictOfCategories.hasOwnProperty(categoryValue)){
            $(this).hide(500);
            $("#add-category").show(500);
            dictOfCategories[categoryValue] = {"listOfScores":{}};
            $("#category-container").append(`
                <div id="category-${categoryValue}" class="category">
                    <h1>${categoryValue}</h1>
                    <div class="d-flex">
                        <div class="left-col">
                            <div id="score-container-${categoryValue}" class="score-container">
                            </div>
                            <div class="">
                                <button id="add-score-${categoryValue}">Add Assignment+</button>
                                <button id="add-predicted-${categoryValue}">Add Predicted Assignment+</button>
                            </div>
                        </div>
                        <div class="right-col">
                            Predict Category
                            <label class="switch">
                                <input class="predicted-${categoryValue}" type="checkbox" checked>
                                <span class="slider round"></span>
                            </label>
                            <input id="predicted-num-${categoryValue}" type="text" placeholder="Predicted Category %">
                        </div>
                    </div>
                    <div>
                        <button id="delete-category-${categoryValue}" class="delete-category"><span class="material-symbols-outlined"> close </span></button>
                    </div>
                </div>
            `);
            $(`#predicted-num-${categoryValue}`).change(function(e){
                dictOfCategories[categoryValue]["predictedValue"] = $(this).val();
            });
            $(`#predicted-${categoryValue}`).change(function(e){
                if($(this).is(":checked")){
                    dictOfCategories[categoryValue]["predictedCategory"] = true;
                } else {
                    dictOfCategories[categoryValue]["predictedCategory"] = false;
                }
            });
            $("#delete-category-"+categoryValue).click(function(){
                $(`#category-${categoryValue}`).hide(500);
                let $this = $(this);
                setTimeout(function(){
                    $this.parents(`#category-${categoryValue}`).first().remove();
                    console.log("")
                }, 500);
            });
            $("#add-score-"+categoryValue).click(function(){
                let scoreID = Date.now();
                let specificID = `${categoryValue}-${scoreID}`;
                let scoreNumerator = "numerator-" + specificId;
                let scoreDenominator = "denominator-" + specificId;
                $(`#score-container-${categoryValue}`).append(`
                <div id="score-${specificID}" class="score">
                    <input id=${scoreNumerator} class="" type="text" placeholder="Points Earned" size="14"> &nbsp;&nbsp;&nbsp;out of&nbsp; &nbsp;&nbsp;
                    <input id=${scoreDenominator} class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                    <button id="delete-${specificID}">Delete</button>
                </div>
                `);
                $(`#score-${specificID}`).change(function(){
                    dictOfCategories[categoryValue][specificID][0] = $("#"+scoreNumerator).val();
                    dictOfCategories[categoryValue][specificID][1] = $("#"+scoreDenominator).val();
                    predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), $("#grade-goal").val());
                });
                $(`#delete-${specificID}`).click(function(){
                    $(this).parent().remove();
                    delete dictOfCategories[categoryValue];
                    predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val());
                });
            });   
            $("#add-category")[0].focus();
            $("#category-input").val("");
        }
    });
});


//Dict of categories (each key is an id):
    //dict of assignments (each key is an id):
        //in assignment: score, totalScore, (in "tuple" indexes 0 and 1), (score -1 = future assignment)
    //category needed (predictedCategory): true/false
    //predicted category (predictedValue) value


function predict_grade_parse(dictionary, startDate, endDate, gradeGoal){
	let start = new Date(startDate);
	let end = new Date(endDate);
	let semesterProgress = (Date.now() - start.parse())/(end.parse()-start.parse());

	let gradeables = {};
	let futures = {};
	let remaining_avg = {};
	let predict_cats = [];

	for(let cat in dictionary){
		gradeables.set(cat, []);
		futures.set(cat, []);
		remaining_avg.set(cat, dictionary[cat][2]);
		for(let asig in cat){
			if(dictionary[cat][asig][0]==-1){
				gradeables[cat].push([dictionary[cat][asig][0], dictionary[cat][asig][1]]);
			}
			else{
				futures[cat].push(dictionary[cat][asig][1]);
			}
		}
		if(dictionary[cat][1]){
			predict_cats.push(cat);
		}
	}
	
	predict_grade(semesterProgress, gradeables, futures, remaining_avg, predict_cats, gradeGoal);
}



function predict_grade(
	semester_progress, // decimal indicating how much of the semester (time wise) has been completed
	all_gradeables, // dictionary of categories -> list of tuples (points earned, points possible)
	future_assignments, // dictionary of categories -> list of (points possible)
	remaining_avg, // dictionary of categories -> avg score expected for that category
	predict_categories, // list of strings indicating which category to predict grades for
	grade_goal // grade user wants to get
) {
	let tot_points = 0;
	let possible_subscore = 0;
	let expected_subscore = 0;

	for (let cat in all_gradeables) {
		let asig_score = 0;
		let asig_possible = 0;
		for(let asig in all_gradeables[cat]){
			asig_score += all_gradeables[cat][asig][0];
			asig_possible += all_gradeables[cat][asig][1];
		}
			if(predict_categories.includes(cat)){
			continue;
		}
		if(future_assignments[cat].length==0){
			asig_score += (asig_possible / semester_progress) * (1-semester_progress) * remaining_avg[cat];
			asig_possible /= semester_progress;
		}
		else{
			for(let asig in future_assignments[cat]){
				asig_score += future_assignments[cat][asig] * remaining_avg[cat];
				asig_possible += future_assignments[cat][asig];
			}
		}
		expected_subscore += asig_score;
			possible_subscore += asig_possible;
		tot_points += asig_possible;
	}
	for(let cat in predict_categories) {
		let cur_predict_score = 0;
		for(let asig in all_gradeables[predict_categories[cat]]){
			expected_subscore += all_gradeables[predict_categories[cat]][asig][0];
			possible_subscore += all_gradeables[predict_categories[cat]][asig][1];
			tot_points += all_gradeables[predict_categories[cat]][asig][1];
			cur_predict_score += all_gradeables[predict_categories[cat]][asig][1];
		}
			if(future_assignments[predict_categories[cat]].length==0){
			tot_points += cur_predict_score / semester_progress * (1-semester_progress);
		}
		else{
			for(let asig in future_assignments[predict_categories[cat]]){
				tot_points += future_assignments[predict_categories[cat]][asig];
			}
		}
	}

	let required_tot = tot_points * grade_goal;
	let required_rem = required_tot - expected_subscore;
	let required_avg = required_rem / (tot_points - possible_subscore);
		
	return required_avg;
}
