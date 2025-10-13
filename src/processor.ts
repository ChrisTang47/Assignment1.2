import * as fs from 'fs' // sync version
import * as fsPromises from 'fs/promises' // async version (Promise-based fs API)
import * as path from 'path'
import { splitBill, BillInput, BillOutput } from './core'

/**
 * 解析命令列參數
 * @param args 命令列參數陣列 (例如：['node', 'cli.ts', '--input=bill.json', '--output=result.json'])
 * @returns 解析後的參數物件
 */
function parseArgs(args: string[]): {
  input: string
  output: string
  format: string
} {
  let input = ''
  let output = ''
  let format = 'json' // 預設為 json 格式

  // 遍歷所有參數
  for (const arg of args) {
    if (arg.startsWith('--input=')) {
      input = arg.split('=')[1]
    } else if (arg.startsWith('--output=')) {
      output = arg.split('=')[1]
    } else if (arg.startsWith('--format=')) {
      format = arg.split('=')[1]
    }
  }

  // 檢查必要參數
  if (!input || !output) {
    throw new Error('使用方式：npx ts-node src/cli.ts --input=檔案路徑 --output=輸出路徑 [--format=json|text]')
  }

  return { input, output, format }
}

/**
 * 主程式入口點
 * @param args 命令列參數陣列
 * @description 解析命令列參數並執行相應的處理邏輯，支援單一檔案和批次處理模式
 */
export function main(args: string[]): void {
  try {
    // 解析命令列參數
    const { input, output, format } = parseArgs(args)
    
    console.log(`✅ 參數解析成功：`)
    console.log(`   輸入: ${input}`)
    console.log(`   輸出: ${output}`)
    console.log(`   格式: ${format}`)
    
    // TODO: 接下來實現檔案處理邏輯
    
  } catch (error) {
    console.error(`❌ 錯誤: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}
