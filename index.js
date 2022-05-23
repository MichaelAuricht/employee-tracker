function loadMainPrompts(){
    prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices:[{
                naame: 'View all employees',
                value:'VIEW_EMPLOYEES'
            },
        {

        }]
        }
    ])
}
