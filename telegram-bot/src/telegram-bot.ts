import { Telegram } from "./utils/telegram"

class TelegramChat {
    id: number | undefined
    is_bot: boolean | undefined
    username: string | undefined
}

class TelegramMessage {
    text: string | undefined
    chat: TelegramChat | undefined
}

class BotCommandEventBody {
    message: TelegramMessage | undefined
}

class BotCommandEvent {
    body: string | undefined
}
export async function main(event: BotCommandEvent): Promise<Object> {
    const body: BotCommandEventBody = JSON.parse(event.body ?? "")

    const chatId = "" + body?.message?.chat?.id
    const telegram = new Telegram(process.env.BOT_TOKEN ?? "", chatId)
    const command = body?.message?.text
    if (command === "/chatId") {
        await telegram.sendAnswer()
    } else {
        await telegram.sendUnknownCommand()
    }
    return { status: 200 }
}