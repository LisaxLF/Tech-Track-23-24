const population = {
    male: "5",
    female: 93,
    others: {
        non: 12,
        fluid: 10
    }
};

function generateTable() {

    population.map(item => {
        item = parseInt(item);
        console.log(item);
        return item;
    })

    let genders = Object.values(population);

    console.log(genders);
}