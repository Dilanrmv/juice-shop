/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import challengeUtils = require('../lib/challengeUtils')
import { type Request, type Response, type NextFunction } from 'express'
import { challenges } from '../data/datacache'

const security = require('../lib/insecurity');
module.exports = function performRedirect() {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const toUrl: string = query.to as string;

    // Lista de URLs permitidas
    const allowedUrls = [
      'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW',
      'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm',
      'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6',
    ];

    if (security.isRedirectAllowed(toUrl) && allowedUrls.includes(toUrl)) {
      challengeUtils.solveIf(challenges.redirectCryptoCurrencyChallenge, () => {
        return toUrl === 'https://explorer.dash.org/address/Xr556RzuwX6hg5EGpkybbv5RanJoZN17kW' ||
               toUrl === 'https://blockchain.info/address/1AbKfgvw9psQ41NbLi8kufDQTezwG8DRZm' ||
               toUrl === 'https://etherscan.io/address/0x0f933ab9fcaaa782d0279c300d73750e1311eae6';
      });
      challengeUtils.solveIf(challenges.redirectChallenge, () => isUnintendedRedirect(toUrl));

      res.redirect(toUrl); // Redirige solo si está en la lista permitida.
    } else {
      res.status(406);
      next(new Error('Unrecognized or disallowed target URL for redirect: ' + toUrl));
    }
  };
};

function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !utils.startsWith(toUrl, allowedUrl)
  }
  return unintended
}
