let UNUSED = `
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
                        <button>Add Past Assignment</button>
                        <button>Add Future Assignment</button>
                    </div>
                </div>
                <div class="right-col">
                    Predict Category
                    <label class="switch">
                        <input type="checkbox" checked>
                        <span class="slider round"></span>
                    </label>
                    <input type="text" placeholder="Average future score on <thing>">
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
    //Default dates
    $("#start-date")[0].valueAsDate = new Date("08-28-23");
    $("#end-date")[0].valueAsDate = new Date("12-08-23");
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
            dictOfCategories[categoryValue] = {};
            $("#category-container").append(`
                <div id="category-${categoryValue}" class="category">
                    <h1>${categoryValue}</h1>
                    <div class="d-flex">
                        <div class="left-col">
                            <div id="score-container-${categoryValue}" class="score-container">
                            </div>
                            <div class="">
                                <button id="add-score-${categoryValue}">Add Past Assignment</button>
                                <button id="add-predicted-${categoryValue}">Add Future Assignment</button>
                            </div>
                        </div>
                        <div class="right-col">
                            Autofill grades:
                            <label class="switch">
                                <input id="predicted-${categoryValue}" type="checkbox">
                                <span class="slider round"></span>
                            </label>
                            <input id="predicted-num-${categoryValue}" type="text" placeholder="Average going forward (%)">
                        </div>
                    </div>
                    <div>
                        <button id="delete-category-${categoryValue}" class="delete-category"><span class="material-symbols-outlined"> close </span></button>
                    </div>
                </div>
            `);
            dictOfCategories[categoryValue]["predictedValue"] = Number($(`#predicted-num-${categoryValue}`).val())/100;
            $(`#predicted-num-${categoryValue}`).on("change keypress", function(e){
                dictOfCategories[categoryValue]["predictedValue"] = Number($(this).val())/100;
                if($(`#predicted-num-${categoryValue}`).val()==""){
                    let cur = 0;
                    let tot = 0;
                    for(let asig in dictOfCategories[categoryValue]["assignments"]){
                        cur += Number(dictOfCategories[categoryValue]["assignments"][asig][0]);
                        tot += Number(dictOfCategories[categoryValue]["assignments"][asig][1]);
                    }
                    $(`predicted-num-${categoryValue}`) .val(cur/tot);    
                    dictOfCategories[categoryValue]["predictedValue"] = cur / tot;  
                    console.log(cur + "   " + tot);          
                }
                predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
            });
            dictOfCategories[categoryValue]["predictedCategory"] = !$(`#predicted-${categoryValue}`).is(":checked");
            $(`#predicted-num-${categoryValue}`).hide();
            $(`#predicted-${categoryValue}`).change(function(e){
                if($(this).is(":checked")){
                    $(`#predicted-num-${categoryValue}`).show();
                } else {
                    $(`#predicted-num-${categoryValue}`).hide();
                }
                dictOfCategories[categoryValue]["predictedCategory"] = !$(this).is(":checked");
                if($(`#predicted-num-${categoryValue}`).val()==""){
                    let cur = 0;
                    let tot = 0;
                    for(let asig in dictOfCategories[categoryValue]["assignments"]){
                        cur += Number(dictOfCategories[categoryValue]["assignments"][asig][0]);
                        tot += Number(dictOfCategories[categoryValue]["assignments"][asig][1]);
                    }
                    $(`predicted-num-${categoryValue}`) .val(cur/tot);    
                    dictOfCategories[categoryValue]["predictedValue"] = cur / tot;  
                    console.log(cur + "   " + tot);          
                }
                predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
            });
            $("#delete-category-"+categoryValue).click(function(){
                $(`#category-${categoryValue}`).hide(500);
                let $this = $(this);
                delete dictOfCategories[categoryValue];
                predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
                setTimeout(function(){
                    $this.parents(`#category-${categoryValue}`).first().remove();
                }, 500);
            });
            $("#grade-goal").on("change keypress", function(e){
                predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
            });
            $("#add-score-"+categoryValue+", "+"#add-predicted-"+categoryValue).click(function(){
                let scoreID = Date.now();
                let specificID = `${categoryValue}-${scoreID}`;
                let scoreNumerator = "numerator-" + specificID;
                let scoreDenominator = "denominator-" + specificID;
                if($(this).attr("id") == "add-score-" + categoryValue){
                    $(`#score-container-${categoryValue}`).append(`
                    <div id="score-${specificID}" class="score">
                        <input id=${scoreNumerator} class="" type="text" placeholder="Points Earned" size="14"> &nbsp;&nbsp;&nbsp;out of&nbsp; &nbsp;&nbsp;
                        <input id=${scoreDenominator} class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                        <button id="delete-${specificID}">Delete</button>
                    </div>
                    `);
                } else {
                    $(`#score-container-${categoryValue}`).append(`
                    <div id="score-${specificID}" class="score generated">
                        <input id=${scoreNumerator} class="hidden" type="text" placeholder="Points Earned" size="14" value="-1">
                        <input id=${scoreDenominator} class="" type="text" placeholder="Points Possible" size="14">&nbsp;&nbsp;&nbsp;
                        <button id="delete-${specificID}">Delete</button>
                    </div>
                    `);
                }
                $(`#score-${specificID}`).on("change keypress", function(e){
					if(!dictOfCategories[categoryValue].hasOwnProperty("assignments")){
                        dictOfCategories[categoryValue]["assignments"] = {};
                    }
                    if(!dictOfCategories[categoryValue]["assignments"].hasOwnProperty(specificID)){
                        dictOfCategories[categoryValue]["assignments"][specificID] = [0, 0];
                    }

                    dictOfCategories[categoryValue]["assignments"][specificID][0] = $("#"+scoreNumerator).val();
                    dictOfCategories[categoryValue]["assignments"][specificID][1] = $("#"+scoreDenominator).val();
                    if($(`#predicted-num-${categoryValue}`).val()==""){
                        let cur = 0;
                        let tot = 0;
                        for(let asig in dictOfCategories[categoryValue]["assignments"]){
                            cur += Number(dictOfCategories[categoryValue]["assignments"][asig][0]);
                            tot += Number(dictOfCategories[categoryValue]["assignments"][asig][1]);
                        }
                        $(`predicted-num-${categoryValue}`) .val(cur/tot);    
                        dictOfCategories[categoryValue]["predictedValue"] = cur / tot;  
                        console.log(cur + "   " + tot);          
                    }
                    predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
                    
                });
                $(`#delete-${specificID}`).click(function(){
                    $(this).parent().remove();
                    delete dictOfCategories[categoryValue]["assignments"][specificID];
                    if($(`#predicted-num-${categoryValue}`).val()==""){
                        let cur = 0;
                        let tot = 0;
                        for(let asig in dictOfCategories[categoryValue]["assignments"]){
                            cur += Number(dictOfCategories[categoryValue]["assignments"][asig][0]);
                            tot += Number(dictOfCategories[categoryValue]["assignments"][asig][1]);
                        }
                        $(`predicted-num-${categoryValue}`) .val(cur/tot);    
                        dictOfCategories[categoryValue]["predictedValue"] = cur / tot;  
                        console.log(cur + "   " + tot);          
                    }
                    predict_grade_parse(dictOfCategories, $("#start-date").val(), $("#end-date").val(), Number($("#grade-goal").val())/100, $("#overall-grade"));
                });
            });   
            $("#add-category")[0].focus();
            $("#category-input").val("");
        }
    });
});


//Dict of categories (each key is an id): layer 1, access  for dict [0]
    //dict of assignments (each key is an id): layer 2
        //in assignment: score, totalScore, (in "tuple" indexes 0 and 1), (score -1 = future assignment) layer 3
    //category needed (predictedCategory): true/false
    //predicted category (predictedValue) value


function predict_grade_parse(dictionary, startDate, endDate, gradeGoal, overall){
	let start = new Date(startDate);
	let end = new Date(endDate);
	let semesterProgress = (Date.now() - Date.parse(start))/(Date.parse(end)-Date.parse(start));

	let gradeables = {};
	let futures = {};
	let remaining_avg = {};
	let predict_cats = [];

	for(let cat in dictionary){
		gradeables[cat] = [];
		futures[cat] = [];
		remaining_avg[cat] = dictionary[cat]["predictedValue"];
		for(let asig in dictionary[cat]["assignments"]){
            if(Number(dictionary[cat]["assignments"][asig][1])==0){
				overall.text("Grade needed %");
			}
			if(Number(dictionary[cat]["assignments"][asig][0])==-1){
				futures[cat].push(Number(dictionary[cat]["assignments"][asig][1]));
			}
			else{
				gradeables[cat].push([Number(dictionary[cat]["assignments"][asig][0]), Number(dictionary[cat]["assignments"][asig][1])]);
			}
		}
		if(dictionary[cat]["predictedCategory"]){
			predict_cats.push(cat);
		}
	}
    let answer = predict_grade(semesterProgress, gradeables, futures, remaining_avg, predict_cats, gradeGoal);
    let cats = "";
    for(let cat in predict_cats){
        cats += predict_cats[cat]+", ";
    }
    cats = cats.substring(0, cats.length-2);
    if(Number(answer)>100){
        overall.text("You cannot obtain this grade without earning extra credit.");
    }
    else if(Number(answer)<0){
        overall.text("Average grade needed on " + cats + ": 0%");
    }
    else{
        overall.text("Average grade needed on " + cats + ": "+answer + "%");
    }
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
    	
	return (required_avg*100).toFixed(1);
}
