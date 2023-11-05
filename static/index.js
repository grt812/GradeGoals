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
$(function(){
    let dictOfCategories = {};
    $("#add-category").click(function(){
        $(this).hide(500);
        $("#category-input").show(500);
        $("#category-input")[0].focus();
    });
    $("#category-input").keypress(function(e){
        if(e.keyCode == 13 && $("#category-input").val().length >=2){
            $(this).hide(500);
            $("#add-category").show(500);
            let categoryValue = $("#category-input").val();
            if(!dictOfCategories.hasOwnProperty(categoryValue)){
                dictOfCategories[categoryValue] = "";
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
                                    <input type="checkbox" checked>
                                    <span class="slider round"></span>
                                </label>
                                <input type="text" placeholder="Predicted Category %">
                            </div>
                        </div>
                        <div>
                            <button id="delete-category-${categoryValue}" class="delete-category"><span class="material-symbols-outlined"> close </span></button>
                        </div>
                    </div>
                `);
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
                    $(`#score-container-${categoryValue}`).append(`
                    <div id=score-${categoryValue}-${scoreID} class="score">
                        <input id=${""} class="" type="text" placeholder="Points Earned" size="14"> &nbsp;&nbsp;&nbsp;out of&nbsp; &nbsp;&nbsp;
                        <input id=${""} class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                        <button id="delete-${categoryValue}-${scoreID}">Delete</button>
                    </div>
                    `);
                    $(`#delete-${categoryValue}-${scoreID}`).click(function(){
                        $(this).parent().remove();
                    });
                });   
                $("#add-category")[0].focus();
                $("#category-input").val("");
            } 
        }
    });
        
    });

    $("").keydown(function(event) {
        /*
         * update dictionary
         */
        predict_grade();
});


function predict_grade(
	semester_progress, // decimal indicating how much of the semester (time wise) has been completed
	all_gradeables, // dictionary of categories -> list of tuples (points earned, points possible)
	future_assignments, // dictionary of categories -> list of (points possible)
	remaining_avg, // dictionary of categories -> avg score expected for that category
	predict_category, // string indicating which category to predict grades for
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
      	if(cat==predict_category){
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
		possible_subscore += asig_possible;
		expected_subscore += asig_score;
		tot_points += asig_possible;
	}
	
	for(let asig in all_gradeables[predict_category]){
		tot_points += all_gradeables[predict_category][asig][1];
	}

	let required_tot = tot_points * grade_goal;
	let required_rem = required_tot - expected_subscore;
	let required_avg = required_rem / (tot_points - possible_subscore);
      console.log(tot_points);
      console.log(required_tot);
      console.log(possible_subscore);
      console.log(expected_subscore);
      console.log(required_rem);

	return required_avg;
}