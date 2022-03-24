import fetch from "node-fetch"

export class Telegram {
    readonly token: string
    readonly chatId: string
    private readonly endpoint: string = 'https://api.telegram.org/bot%token/sendMessage?chat_id=%chatId&text=%message'

    constructor(token: string, chatId: string) {
        this.token = token
        this.chatId = chatId
    }

    async sendUnknownCommand(): Promise<unknown> {
        return this.internalSend("Unknown command\nAvailable commands:\n- /chatId")
    }

    async sendAnswer(): Promise<unknown> {
        const message = "Your chat-id is " + this.chatId

        return this.internalSend(message)
    }

    private async internalSend(message: string): Promise<unknown> {
        let endpointUrl = this.endpoint
        .replace('%token', this.token)
        .replace('%chatId', this.chatId)
        .replace('%message', encodeURI(message))

        const response = await fetch(endpointUrl)
        return await response.json()
    }

}