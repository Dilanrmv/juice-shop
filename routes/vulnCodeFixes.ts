import { type NextFunction, type Request, type Response } from 'express'
import * as accuracy from '../lib/accuracy'

const challengeUtils = require('../lib/challengeUtils')
const fs = require('fs')
const yaml = require('js-yaml')

const FixesDir = 'data/static/codefixes'

interface codeFix {
  fixes: string[]
  correct: number
}

type cache = Record<string, codeFix>

const CodeFixes: cache = {}

export const readFixes = (key: string) => {
  if (CodeFixes[key]) {
    return CodeFixes[key]
  }
  const files = fs.readdirSync(FixesDir)
  const fixes: string[] = []
  let correct: number = -1
  for (const file of files) {
    if (file.startsWith(`${key}_`)) {
      const fix = fs.readFileSync(`${FixesDir}/${file}`).toString()
      const metadata = file.split('_')
      const number = metadata[1]
      fixes.push(fix)
      if (metadata.length === 3) {
        correct = parseInt(number, 10)
        correct--
      }
    }
  }

  CodeFixes[key] = {
    fixes,
    correct
  }
  return CodeFixes[key]
}

interface FixesRequestParams {
  key: string
}

interface VerdictRequestBody {
  key: string
  selectedFix: number
}

export const serveCodeFixes = () => (req: Request<FixesRequestParams, Record<string, unknown>, Record<string, unknown>>, res: Response, next: NextFunction) => {
  const key = req.params.key
  const fixData = readFixes(key)
  if (fixData.fixes.length === 0) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
    return
  }
  res.status(200).json({
    fixes: fixData.fixes
  })
}

export const checkCorrectFix = () => async (req: Request<Record<string, unknown>, Record<string, unknown>, VerdictRequestBody>, res: Response, next: NextFunction) => {
  const key = req.body.key
  const selectedFix = req.body.selectedFix
  const fixData = readFixes(key)
  if (fixData.fixes.length === 0) {
    res.status(404).json({
      error: 'No fixes found for the snippet!'
    })
  } else {
   const fs = require('fs');
const yaml = require('js-yaml');

let explanation;
try {
  // Verificar si el archivo existe y es accesible
  fs.accessSync('./data/static/codefixes/' + key + '.info.yml', fs.constants.F_OK);

  // Leer y procesar el archivo YAML
  const codingChallengeInfos = yaml.load(fs.readFileSync('./data/static/codefixes/' + key + '.info.yml', 'utf8'));
  
  // Buscar la información de la corrección
  const selectedFixInfo = codingChallengeInfos?.fixes.find(({ id }) => id === selectedFix + 1);
  
  // Asignar la explicación si existe
  if (selectedFixInfo?.explanation) explanation = res.__(selectedFixInfo.explanation);

} catch (err) {
  // Captura de errores si el archivo no existe o no es accesible
  console.error('No se pudo acceder al archivo:', err.message);
}

if (selectedFix === fixData.correct) {
  await challengeUtils.solveFixIt(key);
  res.status(200).json({
    verdict: true,
    explanation
  });
}

    } else {
      accuracy.storeFixItVerdict(key, false)
      res.status(200).json({
        verdict: false,
        explanation
      })
    }
  }
}
