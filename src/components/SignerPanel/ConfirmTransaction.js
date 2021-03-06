import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Info, SafeLink, theme } from '@aragon/ui'
import { isElectron, noop } from '../../utils'
import providerString from '../../provider-strings'
import ActionPathsContent from './ActionPathsContent'
import SignerButton from './SignerButton'
import AddressLink from './AddressLink'

class ConfirmTransaction extends React.Component {
  static propTypes = {
    direct: PropTypes.bool.isRequired,
    hasAccount: PropTypes.bool.isRequired,
    hasWeb3: PropTypes.bool.isRequired,
    intent: PropTypes.object.isRequired,
    networkType: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSign: PropTypes.func.isRequired,
    paths: PropTypes.array.isRequired,
    pretransaction: PropTypes.string,
    signError: PropTypes.string,
    signingEnabled: PropTypes.bool.isRequired,
    walletNetworkType: PropTypes.string.isRequired,
    onRequestEnable: PropTypes.func,
  }

  static defaultProps = {
    intent: {},
    paths: [],
    pretransaction: null,
    onClose: noop,
    onSign: noop,
    onRequestEnable: noop,
  }
  render() {
    const {
      direct,
      hasAccount,
      hasWeb3,
      intent,
      locator,
      networkType,
      onClose,
      onRequestEnable,
      onSign,
      paths,
      pretransaction,
      signError,
      signingEnabled,
      walletNetworkType,
      walletProviderId,
    } = this.props

    if (!hasWeb3) {
      if (isElectron()) {
        return (
          <Web3ProviderError
            intent={intent}
            onClose={onClose}
            neededText="You need to have Frame installed and enabled"
            actionText={
              <span>
                Please install and enable Frame (
                <SafeLink href={'https://frame.sh/'} target="_blank">
                  frame.sh
                </SafeLink>
                ).
              </span>
            }
          />
        )
      }
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText="You need to have a Web3 instance installed and enabled"
          actionText={`Please enable ${providerString(
            'your Ethereum provider',
            walletProviderId
          )}.`}
        />
      )
    }

    if (!hasAccount) {
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText={`You need to unlock and enable ${providerString(
            'your Ethereum provider',
            walletProviderId
          )}`}
          actionText={
            <span>
              Please unlock and{' '}
              <ButtonLink onClick={onRequestEnable}>enable</ButtonLink>{' '}
              {providerString('your Ethereum provider', walletProviderId)}.
            </span>
          }
        />
      )
    }

    if (walletNetworkType !== networkType) {
      return (
        <Web3ProviderError
          intent={intent}
          onClose={onClose}
          neededText={`
            You need to be connected to the ${networkType} network
          `}
          actionText={`
            Please connect ${providerString(
              'your Ethereum provider',
              walletProviderId
            )} to the ${networkType} network.
          `}
        />
      )
    }

    const possible =
      (direct || (Array.isArray(paths) && paths.length)) && !signError

    return possible ? (
      <ActionPathsContent
        intent={intent}
        direct={direct}
        locator={locator}
        onSign={onSign}
        paths={paths}
        pretransaction={pretransaction}
        signingEnabled={signingEnabled}
        walletProviderId={walletProviderId}
      />
    ) : (
      <ImpossibleContent error={signError} intent={intent} onClose={onClose} />
    )
  }
}

const ImpossibleContent = ({
  error,
  intent: { description, name, to },
  onClose,
}) => (
  <React.Fragment>
    <Info.Permissions title="Action impossible">
      The action {description && `“${description}”`} failed to execute on{' '}
      <AddressLink to={to}>{name}</AddressLink>.{' '}
      {error
        ? 'An error occurred when we tried to find a path or send a transaction for this action.'
        : 'You might not have the necessary permissions.'}
    </Info.Permissions>
    <SignerButton onClick={onClose}>Close</SignerButton>
  </React.Fragment>
)

ImpossibleContent.propTypes = {
  error: PropTypes.bool,
  intent: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
}

const Web3ProviderError = ({
  intent: { description, name, to },
  onClose,
  neededText = '',
  actionText = '',
}) => {
  return (
    <React.Fragment>
      <Info.Action title="You can't perform any action">
        {neededText} in order to perform{' '}
        {description ? `"${description}"` : 'this action'}
        {' on '}
        <AddressLink to={to}>{name}</AddressLink>.
        <ActionMessage>{actionText}</ActionMessage>
      </Info.Action>
      <SignerButton onClick={onClose}>Close</SignerButton>
    </React.Fragment>
  )
}

Web3ProviderError.propTypes = {
  actionText: PropTypes.node.isRequired,
  intent: PropTypes.object.isRequired,
  neededText: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

const ActionMessage = styled.p`
  margin-top: 15px;
`

const ButtonLink = styled.button.attrs({ type: 'button' })`
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
  color: ${theme.textPrimary};
  cursor: pointer;
  background: none;
  border: 0;
`

export default ConfirmTransaction
