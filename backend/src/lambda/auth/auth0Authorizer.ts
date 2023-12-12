import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-fzey3ds0v3hjmve6.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const token = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', token)

    return {
      principalId: token.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}


//get Token
function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const arr = authHeader.split(' ')
  const token = arr[1]
  return token
}

//verify Token
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info('==> start verifying Token', authHeader.substring(0, 20))
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const response = await Axios.get(jwksUrl);
  const keys = response.data.keys;
  const signingKeys = keys.find(key => key.kid === jwt.header.kid);
  logger.info('===> signingKeys', signingKeys)
  if (!signingKeys) {
    throw new Error('Keys is invalid')
  }

  // get pemData and return token
  const pemDataKey = signingKeys.x5c[0]
  const secretKey = `-----BEGIN CERTIFICATE-----\n${pemDataKey}\n-----END CERTIFICATE-----\n`;
  const returnToken = verify(token, secretKey, { algorithms: ['RS256'] }) as JwtPayload
  logger.info('===> verifyToken', returnToken)
  return returnToken
}
