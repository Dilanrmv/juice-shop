/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as models from '../models/index'
import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import { challenges } from '../data/datacache'

import * as utils from '../lib/utils'
const challengeUtils = require('../lib/challengeUtils')

class ErrorWithParent extends Error {
  parent: Error | undefined
}
// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge
module.exports = function searchProducts () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? '';
      criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200);

      const sanitizedCriteria = `%${criteria.replace(/['"%_]/g, '')}%`;

      const [products]: any = await models.sequelize.query(
        'SELECT * FROM Products WHERE ((name LIKE :search OR description LIKE :search) AND deletedAt IS NULL) ORDER BY name',
        {
          replacements: { search: sanitizedCriteria },
          type: models.sequelize.QueryTypes.SELECT
        }
      );

      const dataString = JSON.stringify(products);
      if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) { // vuln-code-snippet hide-start
        let solved = true;
        const data = await UserModel.findAll();
        const users = utils.queryResultToJson(data);
        if (users.data?.length) {
          for (let i = 0; i < users.data.length; i++) {
            solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password);
          }
        }

        if (solved) {
          challengeUtils.solve(challenges.unionSqlInjectionChallenge);
        }
      }

      res.json(products);
    } catch (err) {
      next(err);
    }
  };
};

if (!solved) {
                  break
                }
              }
              if (solved) {
                challengeUtils.solve(challenges.unionSqlInjectionChallenge)
              }
            }
          }).catch((error: Error) => {
            next(error)
          })
        }
        if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
          let solved = true
          void models.sequelize.query('SELECT sql FROM sqlite_master').then(([data]: any) => {
            const tableDefinitions = utils.queryResultToJson(data)
            if (tableDefinitions.data?.length) {
              for (let i = 0; i < tableDefinitions.data.length; i++) {
                if (tableDefinitions.data[i].sql) {
                  solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)
                  if (!solved) {
                    break
                  }
                }
              }
              if (solved) {
                challengeUtils.solve(challenges.dbSchemaChallenge)
              }
            }
          })
        } // vuln-code-snippet hide-end
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }
        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
