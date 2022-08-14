import { AvailableBot } from '../available-bot'
import { StoredSettings } from '../store'
import { VersionCheck } from '../version-check'
import { createCustomStoredSettings } from './mock/stored-settings.mock'

describe('VersionCheck', () => {
  let versionCheck: VersionCheck

  function setup(vaultMaxiVersion?: string, reinvestVersion?: string) {
    const minVaultMaxiVersion = { major: '2', minor: '0' }
    const minReinvestVersion = { major: '1', minor: '0' }

    const customStoredSettings: Partial<StoredSettings> = {}
    if (vaultMaxiVersion) customStoredSettings.state = `idle|none||2145914|${vaultMaxiVersion}`
    if (reinvestVersion) customStoredSettings.reinvest = { state: `idle|none||2145835|${reinvestVersion}` }

    versionCheck = new VersionCheck(
      createCustomStoredSettings(customStoredSettings),
      minVaultMaxiVersion,
      minReinvestVersion,
    )
  }

  it('should return compatible for vault-maxi and lm-reinvest versions undefined', () => {
    setup()

    expect(versionCheck.isCompatibleWith(AvailableBot.MAXI)).toBeTruthy()
    expect(versionCheck.isCompatibleWith(AvailableBot.REINVEST)).toBeTruthy()
  })

  it('should return not compatible for vault-maxi, if version is v1.9', () => {
    setup('v1.9')

    expect(versionCheck.isCompatibleWith(AvailableBot.MAXI)).toBeFalsy()
  })

  it('should return compatible for vault-maxi, if version is v2.0', () => {
    setup('v2.0')

    expect(versionCheck.isCompatibleWith(AvailableBot.MAXI)).toBeTruthy()
  })

  it('should return compatible for vault-maxi, if version is v2.1', () => {
    setup('v2.1')

    expect(versionCheck.isCompatibleWith(AvailableBot.MAXI)).toBeTruthy()
  })

  it('should return not compatible for lm-reinvest, if version is v0.9', () => {
    setup(undefined, 'v0.9')

    expect(versionCheck.isCompatibleWith(AvailableBot.REINVEST)).toBeFalsy()
  })

  it('should return compatible for lm-reinvest, if version is v1.0', () => {
    setup(undefined, 'v1.0')

    expect(versionCheck.isCompatibleWith(AvailableBot.REINVEST)).toBeTruthy()
  })

  it('should return compatible for lm-reinvest, if version is v1.1', () => {
    setup(undefined, 'v1.1')

    expect(versionCheck.isCompatibleWith(AvailableBot.REINVEST)).toBeTruthy()
  })

  it('should return compatible for lm-reinvest, if version is 1', () => {
    setup(undefined, '1')

    expect(versionCheck.isCompatibleWith(AvailableBot.REINVEST)).toBeTruthy()
  })

  it('should return v2.0 for version major 2 and minor 0', () => {
    expect(versionCheck.join({ major: '2', minor: '0' })).toStrictEqual('v2.0')
  })
})