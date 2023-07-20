

// Class for setting up the data
const DataFile = {
    
    // converts the workbook data into a JSON format
    convertJSON(e){
        const file = e.target.files[0].path
        var wb = xlsx.readFile(file).Sheets["M-sat"]
        var convert = xlsx.json(wb)
        return convert
    },

    // For every row/ each object, this function takes the value of each property, puts them into a new array(map), removes the first two elements of that array, and then adds a property called sequence which contains this array to that object. In short, it concatenates the data values from individual cells into an array
    concatSequence (dataSet){
        dataSet.forEach(element => {
            let concat = Object.keys(element).map(function(key){
                return element[key]
            })
            concat.shift()
            concat.shift()
            element.sequence = concat    
        })
        data = dataSet  
    },

    removeElementsByClass(className){
        var elements = document.getElementsByClassName(className)
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0])
        }

    },
 
    removePlaceHolder(){
        document.getElementById('placeHolderText').classList.add('hidden')
    },

    clearText () {
        DataFile.removeElementsByClass('match')
        DataFile.removeElementsByClass('POmatch')
        document.getElementById('placeHolderText').classList.remove('hidden')

    }
}


// --------------------------------------------------------------------

let clr = document.getElementById('clear')
if(clr){
    clr.addEventListener('click', clearText)
}





//function that assigns eventlisteners after on load
window.onload=function(){
    document.querySelector('#selectedFile').addEventListener('change', checkForMatches)
    document.querySelector('#selectedFilePO').addEventListener('change', checkParentOffspring)
    document.querySelector('#clear').addEventListener('click', DataFile.clearText)
}

// checks for matching samples
function checkForMatches(e){

    DataFile.removeElementsByClass('match')
    DataFile.removePlaceHolder()

    // Will give the user an error if there is no sheet called "M-sat"
    const file = e.target.files[0].path
    var wb = xlsx.readFile(file).Sheets["M-sat"]
    if (!wb){
        document.getElementById('placeHolderText').classList.remove('hidden')
         return alert(`Couldn't find a worksheet named "M-sat"`)
        
    } 

    // ----------------------------------
    // Experimental

    

    // ----------------------------------
    

    // initialising variables for file loading / data manipulation
    let data = DataFile.convertJSON(e)

    // Functions to take data in from the excel sheet and manipulate it to suit the test requirements
    DataFile.concatSequence(data)
    

    // Storing matched ids
    let matchIDs = []       


    //First loop will select each row in turn as the sequence to compare against the others
    data.forEach((refSequence, refSeqIndex) => {

        //Second loop will select each sequence in turn to compare against the reference sequence
        for(let compSeqIndex = 0; compSeqIndex < data.length; compSeqIndex++){

            // ------------------------------------- //
            // this variable will be used to store and add the sample id to the message string in the case of dropout or no data matches
            let titles = Object.keys(data[0])
            // Used as an index counter to put the correct sample id into the message string for the above
            let myNum = 2
            

            //  ------------------------------------ //

            //initialising some variables to help ascertain what happened during the comparison
            let finCounter = 0
            let dropoutCounter = 0
            let noDataCounter = 0
            let messageString = ""
            let dropOutMarker = []
            let compSequence = data[compSeqIndex]
            // refSeqIndex is taken from the outermost loop 
            let refSeqLength = data[refSeqIndex].sequence.length
            let sameSamples = (refSequence.ID === compSequence.ID) === true
            let alreadyMatched = null

            matchIDs.forEach(element => {
               if(element.includes(refSequence.ID) && element.includes(compSequence.ID)){
                alreadyMatched = true
               }
            })

            //Check to see that the same id isnt being compared to itself and the two samples aren't already matched
            if(sameSamples === false && alreadyMatched === null){
               

                // Third loop will check the value-pairs of the reference marker against the comparison marker
                for(let markerNum = 0; markerNum < refSeqLength; markerNum += 2){
                    

                    let refMarker1 = data[refSeqIndex].sequence[markerNum] // initially selects the first marker of the reference sequence
                    let refMarker2 = data[refSeqIndex].sequence[markerNum+1] // initially selects the 2nd marker of the reference sequence
                    let compMarker1 = data[compSeqIndex].sequence[markerNum]// initially selects the first marker of the comparison sequence
                    let compMarker2 = data[compSeqIndex].sequence[markerNum+1]// initially selects the second marker of the comparison sequence
                    let refHomZyg = refMarker1 === refMarker2 // returns true if both reference markers are the same / homozygous
                    let compHomZyg = compMarker1 === compMarker2 // returns true if both comparison markers are the same / homozygous

                    //---- Conditions for progressing through the markers -----

                    if(refMarker1 === compMarker1 && refMarker2 === compMarker2){
                        finCounter += 2
                    }

                    else if(refHomZyg && refMarker1 === 0 || compHomZyg && compMarker1 === 0){
                        finCounter += 2
                        noDataCounter += 1
                    }

                    //If both sequences are homozygous and have dropout enabled
                    else if(refSequence.Dropout === true && refHomZyg && data[compSeqIndex].Dropout === true && compHomZyg) {
                        finCounter += 2
                        dropoutCounter += 1
                        myNum = markerNum + 2
                        dropOutMarker.push(` ${titles[myNum]}`) 
                        
                    }

                    //If only the reference sequence has dropout enabled, and one marker matches
                    else if(refSequence.Dropout === true && refHomZyg && refMarker1 === compMarker1 || refSequence.Dropout === true && refHomZyg && refMarker2 === compMarker2){
                        finCounter += 2
                        dropoutCounter += 1
                        myNum = markerNum + 2
                        dropOutMarker.push(` ${titles[myNum]}`) 
                     
                    }
                    else if(compSequence.Dropout === true && compHomZyg && compMarker1 === refMarker1 || compSequence.Dropout === true && compHomZyg && compMarker2 === refMarker2){
                        finCounter += 2
                        dropoutCounter += 1
                        myNum = markerNum + 2
                        dropOutMarker.push(` ${titles[myNum]}`) 
                     
                    }
                    
                }

            }
            if(finCounter === refSeqLength){
                matchIDs.push([refSequence.ID, compSequence.ID])
                messageString += `${refSequence.ID} matches with ${compSequence.ID}. `
            }

            if(dropoutCounter !== 0){
                if(dropoutCounter > 1){
                    messageString += `This assumes allelic drop out at these ${dropoutCounter} markers: ${dropOutMarker}. `
                }else{
                    messageString += `This assumes allelic drop out at marker: ${dropOutMarker}. `
                }
            }

            if(noDataCounter !== 0){
                if(noDataCounter > 1){
                    messageString += `There are ${noDataCounter} markers where at least one sample has no data.`
                }else{
                    messageString += `There is ${noDataCounter} marker where at least one sample has no data.`
                }
                
            }

            if(finCounter === refSeqLength){
                console.log(messageString)
                var li = document.createElement("li")
                li.className = 'match'
                li.innerHTML = messageString
                document.querySelector('.matchResults').appendChild(li)
            }
                        
        }
    })
    if(matchIDs.length === 0){
        alert('No matches found')
        document.getElementById('placeHolderText').classList.remove('hidden')
    }

}

function checkParentOffspring(e){

    DataFile.removeElementsByClass('POmatch')
    DataFile.removePlaceHolder()
    

    // initialising variables for file loading / data manipulation 
    let data = DataFile.convertJSON(e)

    // Functions to take data in from the excel sheet and manipulate it to suit the test requirements
    DataFile.concatSequence(data)
    

    // Storing matched ids
    let matchIDs = []

    // first loop for selecting the reference sequence
    data.forEach((refSequence, refSeqIndex) => {

        
        //Second loop to select the comparison sequence
        for(let compSeqIndex = 0; compSeqIndex < data.length; compSeqIndex++){
            

            // initialising variables for 3rd loop
            let finCounter = 0
            let noDataCounter = 0
            let messageString = ""
            let sampleIDs = ""
            let additionalInfo = ""
            let compSequence = data[compSeqIndex]
            let refSeqLength = data[refSeqIndex].sequence.length
            let sameSamples = (refSequence.ID === compSequence.ID) === true
            let alreadyMatched = null

            // checks to see if the two selected sequences are already matched
            matchIDs.forEach(element => {
                if(element.includes(refSequence.ID) && element.includes(compSequence.ID)){
                 alreadyMatched = true
                }
             })

             // some conditions to prevent 3rd loop from running on edge cases
            if(sameSamples === false && alreadyMatched === null){

                // third loop
                for(let markerNum = 0; markerNum < refSeqLength; markerNum += 2){

                    let refMarker1 = data[refSeqIndex].sequence[markerNum] // initially selects the first marker of the reference sequence
                    let refMarker2 = data[refSeqIndex].sequence[markerNum+1] // initially selects the 2nd marker of the reference sequence
                    let compMarker1 = data[compSeqIndex].sequence[markerNum]// initially selects the first marker of the comparison sequence
                    let compMarker2 = data[compSeqIndex].sequence[markerNum+1]// initially selects the second marker of the comparison sequence
                    let refHomZyg = refMarker1 === refMarker2 // returns true if both reference markers are the same / homozygous
                    let compHomZyg = compMarker1 === compMarker2 // returns true if both comparison markers are the same / homozygous


                    // if ref marker1 matches comp1 or comp 2. Or if ref marker2 matches comp1 or comp2
                    if(refMarker1 === compMarker1 || refMarker1 === compMarker2 || refMarker2 === compMarker1 || refMarker2 === compMarker2){
                        finCounter += 2
                    }

                    else if(refHomZyg && refMarker1 === 0 || compHomZyg && compMarker1 === 0){
                        finCounter += 2
                        noDataCounter += 1
                    }

                }
            };
             
             if(finCounter === refSeqLength){
                matchIDs.push([refSequence.ID, compSequence.ID])
                messageString += `${refSequence.ID} matches with ${compSequence.ID} for the parent offspring test. `
                sampleIDs += `${refSequence.ID} - ${compSequence.ID}`
            }

            if(noDataCounter !== 0){
                if(noDataCounter > 1){
                    messageString += `There are ${noDataCounter} markers where at least one sample has no data.`
                    additionalInfo += `There are ${noDataCounter} markers where at least one sample has no data.`
                }else{
                    messageString += `There is ${noDataCounter} marker where at least one sample has no data.`
                    
                    additionalInfo += `There is ${noDataCounter} marker where at least one sample has no data.`
                }
                
            }

            if(finCounter === refSeqLength){
                console.log(messageString)
                var li = document.createElement("li")
                li.className = 'POmatch'
                li.innerHTML = messageString
                document.querySelector('.parentOffspring').appendChild(li)

                // Create a new <tr> element
                const newRow = document.createElement('tr');

                // Add some content to the new row
                const cell1 = document.createElement('td');
                cell1.textContent = sampleIDs;
                const cell2 = document.createElement('td');
                cell2.textContent = additionalInfo;
                newRow.appendChild(cell1);
                newRow.appendChild(cell2);

                // Find the existing table with the class "tableData"
                const table = document.querySelector('.tableData');

                // Append the new row to the table
                table.appendChild(newRow);


                
            }

        }
    })

    if(matchIDs.length === 0){
        alert('No matches found')
        document.getElementById('placeHolderText').classList.remove('hidden')
    }

}