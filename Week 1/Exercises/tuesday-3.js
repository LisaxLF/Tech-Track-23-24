/*  This array of objects contains some weird data, and some useless points,
	You're tasked in transforming and normalizing this data to the second
	example */

const data = [{
		name: "robert",
		age: "29",
		residence: "amsterdam",
		work: {
			title: "Lecturer",
			employer: "Hogeschool van Amsterdam"
		}
	},
	{
		name: "berend",
		age: "32",
		residence: "rotterdam",
		work: {
			title: "Front-end Developer",
			employer: "DEPT"
		}
	},
	{
		name: "ubaida",
		age: "26",
		residence: "Amersfoort",
		work: {
			title: "Project Manager",
			employer: "Clarify"
		}
	}
];


/* Filter by age, normalize capitals in names, convert ages to numbers, remove work.

	const data = [
		{
			name: "Robert",
			age: 29,
			residence: "Amsterdam",
		},
		{
			name: "Berend",
			age: 32,
			residence: "Rotterdam",
		}
	];

*/

function transformArrOfObj() {
	// Verwijder het laatste object uit de array
	const verwijderdObject = data.pop();

	// Verwijder de eigenschap 'work' uit elk object in de array
	const updatedData = data.map(item => {
		// Converteer de "name" eigenschap naar hoofdletters voor de eerste letter
		item.name = item.name.toLowerCase().charAt(0).toUpperCase() + item.name.toLowerCase().slice(1);

		// Converteer de "residence" eigenschap naar hoofdletters voor de eerste letter
		item.residence = item.residence.toLowerCase().charAt(0).toUpperCase() + item.residence.toLowerCase().slice(1);

		// Verwijder de "work" eigenschap uit het object
		delete item.work;

		return item;
	})
};