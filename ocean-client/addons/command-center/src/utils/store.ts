import SSM from 'aws-sdk/clients/ssm'
import { Bot } from './available-bot'

// handle AWS Paramter
export class Store {
  private ssm: SSM
  private postfix: string
  readonly settings: StoredSettings

  constructor() {
    this.ssm = new SSM()
    this.postfix = process.env.VAULTMAXI_STORE_POSTFIX ?? process.env.VAULTMAXI_STORE_POSTIX ?? ''
    this.settings = new StoredSettings()
  }

  async updateExecutedMessageId(id: number): Promise<unknown> {
    return this.updateParameter(StoreKey.LastExecutedMessageId, '' + id)
  }

  async updateSkip(value: boolean = true): Promise<unknown> {
    return this.updateParameter(StoreKey.Skip, value ? 'true' : 'false')
  }

  async updateRange(min: string, max: string): Promise<void> {
    await this.updateParameter(StoreKey.MinCollateralRatio, min)
    await this.updateParameter(StoreKey.MaxCollateralRatio, max)
  }

  async updateReinvest(value: string, bot?: Bot): Promise<unknown> {
    const key = this.getKeyForBot(StoreKey.Reinvest, StoreKey.LMRReinvest, bot)
    if (!key) return Promise.reject()
    return this.updateParameter(key, value)
  }

  async updateLMPair(value: string, bot?: Bot): Promise<unknown> {
    const key = this.getKeyForBot(StoreKey.LMPair, StoreKey.LMRPair, bot)
    if (!key) return Promise.reject()
    return this.updateParameter(key, value)
  }

  async updateAutoDonation(value: string, bot?: Bot): Promise<unknown> {
    const key = this.getKeyForBot(StoreKey.AutoDonation, StoreKey.LMRAutoDonation, bot)
    if (!key) return Promise.reject()
    return this.updateParameter(key, value)
  }

  async updateStableArbBatchSize(value: string): Promise<unknown> {
    return this.updateParameter(StoreKey.StableArbBatchSize, value)
  }

  async fetchSettings(): Promise<StoredSettings> {
    let TelegramNotificationChatIdKey = this.extendKey(StoreKey.TelegramChatId)
    let TelegramNotificationTokenKey = this.extendKey(StoreKey.TelegramToken)
    let TelegramUserName = this.extendKey(StoreKey.TelegramUserName)
    let LastExecutedMessageIdKey = this.extendKey(StoreKey.LastExecutedMessageId)
    let StateKey = this.extendKey(StoreKey.State)
    let LMPairKey = this.extendKey(StoreKey.LMPair)
    let LMRStateKey = this.extendKey(StoreKey.LMRState)

    //store only allows to get 10 parameters per request
    let parameters =
      (
        await this.ssm
          .getParameters({
            Names: [
              TelegramNotificationChatIdKey,
              TelegramNotificationTokenKey,
              TelegramUserName,
              LastExecutedMessageIdKey,
              StateKey,
              LMPairKey,
              LMRStateKey,
            ],
          })
          .promise()
      ).Parameters ?? []

    this.settings.chatId = this.getValue(TelegramNotificationChatIdKey, parameters)
    this.settings.token = this.getValue(TelegramNotificationTokenKey, parameters)
    this.settings.username = this.getValue(TelegramUserName, parameters)
    this.settings.lastExecutedMessageId = this.getNumberValue(LastExecutedMessageIdKey, parameters)
    this.settings.state = this.getValue(StateKey, parameters)
    this.settings.LMPair = this.getValue(LMPairKey, parameters)
    const lmrState = this.getValue(LMRStateKey, parameters)
    if (lmrState) {
      this.settings.reinvest = { state: lmrState }
    }

    return this.settings
  }

  private async updateParameter(key: StoreKey, value: string): Promise<unknown> {
    const newValue = {
      Name: this.extendKey(key),
      Value: value,
      Overwrite: true,
      Type: 'String',
    }
    return this.ssm.putParameter(newValue).promise()
  }

  private getValue(key: string, parameters: SSM.ParameterList): string {
    return parameters?.find((element) => element.Name === key)?.Value as string
  }

  private getNumberValue(key: string, parameters: SSM.ParameterList): number | undefined {
    let value = parameters?.find((element) => element.Name === key)?.Value
    return value ? +value : undefined
  }

  private getBooleanValue(key: string, parameters: SSM.ParameterList): boolean | undefined {
    let value = parameters?.find((element) => element.Name === key)?.Value
    return value ? JSON.parse(value) : undefined
  }

  private extendKey(key: StoreKey): string {
    return key.replace('-maxi', '-maxi' + this.postfix)
  }

  private getKeyForBot(maxi: StoreKey, reinvest: StoreKey, bot?: Bot): StoreKey | undefined {
    switch (bot) {
      case Bot.MAXI:
        return maxi
      case Bot.REINVEST:
        return reinvest
      default:
        undefined
    }
  }
}

enum StoreKey {
  // defichain-maxi related keys
  Skip = '/defichain-maxi/skip',
  State = '/defichain-maxi/state',
  MaxCollateralRatio = '/defichain-maxi/settings/max-collateral-ratio',
  MinCollateralRatio = '/defichain-maxi/settings/min-collateral-ratio',
  LMPair = '/defichain-maxi/settings/lm-pair',
  Reinvest = '/defichain-maxi/settings/reinvest',
  AutoDonation = '/defichain-maxi/settings/auto-donation-percent-of-reinvest',
  StableArbBatchSize = '/defichain-maxi/settings/stable-arb-batch-size',

  // defichain-maxi lm-reinvest related keys
  LMRState = '/defichain-maxi/state-reinvest',
  LMRPair = '/defichain-maxi/settings-reinvest/lm-pair',
  LMRReinvest = '/defichain-maxi/settings-reinvest/reinvest',
  LMRAutoDonation = '/defichain-maxi/settings-reinvest/auto-donation-percent-of-reinvest',

  // command center related keys
  TelegramChatId = '/defichain-maxi/command-center/telegram/chat-id',
  TelegramToken = '/defichain-maxi/command-center/telegram/token',
  TelegramUserName = '/defichain-maxi/command-center/telegram/username',
  LastExecutedMessageId = '/defichain-maxi/command-center/last-executed-message-id',
}

export class StoredSettings {
  chatId: string = ''
  token: string = ''
  lastExecutedMessageId: number | undefined
  username: string = ''
  state: string = ''
  LMPair: string = ''
  reinvest: { state: string } | undefined
}
