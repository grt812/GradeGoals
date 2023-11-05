let categoryHTML = `
<div id=${""} class="category">
        <h1>${""}</h1>
        <div class="score-container">
            <div id=${""} class="score">
                <input id=${""} class="" type="text" placeholder="Points Earned" size="14"> &nbsp;&nbsp;&nbsp;out of&nbsp; &nbsp;&nbsp;
                <input id=${""} class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                <button id=${""}>Delete</button>
            </div>
        </div>
        <button id=${""}>Add Assignment+</button>
    </div>
`;
$(function(){
    let dictOfCategories = {};
    $("#add-category").click(function(){
        $(this).hide(500);
        $("#category-input").show(500);
    });
    $("#category-input").keypress(function(e){
        if(e.keyCode == 13){
            $(this).hide(500);
            $("#add-category").show(500);
            let categoryValue = $("#category-input").val();
            if(!dictOfCategories.hasOwnProperty(categoryValue)){
                $("#category-container").append(`
                        <div id="category-${categoryValue}" class="category">
                            <h1>${categoryValue}</h1>
                            <div id="score-container-${categoryValue}" class="score-container"></div>
                            <button id="add-${categoryValue}">Add ${categoryValue}+</button>
                        </div>
                `);
                $("#add-"+categoryValue).click(function(){
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
			asig_score += asig[0];
			asig_possible += asig[1];
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
				asig_score += asig * remaining_avg[cat];
				asig_possible += asig;
			}
		}
		possible_subscore += asig_possible[cat];
		expected_subscore += asig_score[cat];
		tot_points += asig_possible[cat];
	}
	
	for(let asig in all_gradeables[predict_category]){
		tot_points += asig;
	}

	let required_tot = tot_points * grade_goal;
	let required_rem = required_tot - expected_subscore;
	let required_avg = required_rem / (tot_points - possible_subscore);

	return required_avg;
}
