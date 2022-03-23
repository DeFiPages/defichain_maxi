
class BotCommandEventBody {
    message: any | undefined
}

class BotCommandEvent {
    body: BotCommandEventBody | undefined
}
export async function main(event: BotCommandEvent): Promise<Object> {
    console.log(event)
    return { status: 200 }
}