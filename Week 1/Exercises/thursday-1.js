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

/* Assume we have a normalized dataset to start with */

const data = [{
		id: 1,
		name: 'Robert',
		kaas: true,
	},
	{
		id: 2,
		name: 'Vincent',
		kaas: false,
	},
	{
		id: 3,
		name: 'Laura',
		kaas: true,
	},
]

/* We only need one function for this, in further exercises, we can try and splitting them
   but for now, we'll only use a single function
*/
function generateTable() {
	// There are a couple steps we need to take, first, we need to select
	// the table, table heading and table body and save them to a variable

	const DataTable = document.querySelector('table')
	const DataTableHeader = document.querySelectorAll('thead')
	const DataTableBody = document.querySelectorAll('tbody')
	console.log(DataTabel)

	/* First, we'll generate a row of table headings, we need to grab the keys
	   from all the objects, not the values! We can achieve this by using the
	   Object.keys(data[0]) method of the native Object. It returns an array of all
	   keys an object contains. We can loop over that array using forEach();
	   It's up to you to find out how then to generate the corresponding HTML.
	*/

	// Stap 1: Verzamel de sleutels van het eerste object in de array
	const Keys = Object.keys(data[0]);

	/* Your HTML should now displ	ay the headers in a <th></th> structure. */
	Keys.forEach(Key => {
		const th = document.createElement('th');
		th.textContent = Key;
		headerRow.appendChild(th);
	});
	/* After this, we can loop over the amount of objects inside of the array
	   (looping over an array of objects can be useful here, for...of). For every entry (forEach())
	   we want to create a new row (<tr>/tr>) and append three datapoints (<td>)
	   inside of it containing the id, name and kaas.
	*/

}

generateTable()