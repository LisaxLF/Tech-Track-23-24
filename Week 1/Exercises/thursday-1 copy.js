/* Before we start, please use the following HTML in your codepen or
   environment of your choice to continue this assignment

   <!-- We start by creating the basics for a table -->

	<table>
		<thead>
			<tr>
			</tr>
		</thead>
		<tbody>
		</tbody>
	</table>
*/

/* Assume we have a non-normalized dataset to start with */

const data = [
	{
		id: 1,
		name: 'ROBERT',
		kaas: false,
		coords: {
			lat: "52.3676",
			long: "4.9041"
		}
	},
	{
		id: "2",
		name: 'viNcent',
		kaas: "true",
		coords: {
			lat: "52.3676",
			long: "4.9041"
		}
	},
	{
		id: 3,
		name: 'laura',
		kaas: true,
		coords: {
			lat: "52.3676",
			long: "4.9041"
		}
	},
]

/* This assignment builds on the earlier assignment we did today. Create a table
   containing the above dataset, this time though, the dataset is a bit scuffed.
   We need to normalize the data by addressing the following issues:

   1) The id is not always a number, convert it to an integer / number first.
   2) The name isn't normalized, random capitals appear. Change this string in a
   first letter capital and lowercase after that
   3) "kaas" is not always a boolean. Convert it to a string so we can print it in HTML
   4) "coords" is an object. If you try and print this, you'll get [object Object] or something.
   We'll have to loop over the object and print a custom string using template literals.
*/

function generateTable() {
  
	const DataTable = document.querySelector('table');
	const DataTableHeader = document.querySelector('thead tr');
	const DataTableBody = document.querySelector('tbody');
  
  console.log(DataTableHeader)
	/* First, we'll generate a row of table headings, we need to grab the keys
	   from all the objects, not the values! We can achieve this by using the
	   Object.keys(data[0]) method of the native Object. It returns an array of all
	   keys an object contains. We can loop over that array using forEach();
	   It's up to you to find out how then to generate the corresponding HTML.
	*/
  
  Object.keys(data[0]).forEach(key => {
    const newth = document.createElement('th')
		newth.textContent = key;
    DataTableHeader.appendChild(newth)
  });

	/* After this, we can loop over the amount of objects inside of the array
	   (looping over an array of objects can be useful here, for...of). For every entry (forEach())
	   we want to create a new row (<tr>/tr>) and append three datapoints (<td>)
	   inside of it containing the id, name and kaas.
	*/
  
  data.forEach(obj => {
    let tr = document.createElement('tr');
		DataTableBody.appendChild(tr);
    
    	for (const [key, value] of Object.entries(obj)) {
        let td = document.createElement('td');
        td.textContent = value; // Use the value, not the property / key!
        tr.appendChild(td) // And append it to the row we just made.
		}
  })
}

generateTable()