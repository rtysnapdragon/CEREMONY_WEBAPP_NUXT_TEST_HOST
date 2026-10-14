class PrintService {

  printLetter(letter: LetterData) {}

  printInvoice(data: any) {}

  printBudget(data: any) {}

}

export default new PrintService()


// import PrintService from '~/services/print.service'

// PrintService.printLetter(letter)
// This pattern is excellent for:

// enterprise SaaS
// micro-feature systems
// large teams
// testability