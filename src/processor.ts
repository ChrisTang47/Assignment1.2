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
 * 讀取並解析 JSON 檔案
 * @param filePath 檔案路徑
 * @returns 解析後的帳單資料
 */
function readBillFile(filePath: string): BillInput {
  try {
    // 檢查檔案是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`檔案不存在: ${filePath}`)
    }

    // 讀取檔案內容
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // 解析 JSON
    const billData = JSON.parse(fileContent) as BillInput
    
    // 基本格式驗證
    if (!billData.date || !billData.location || !billData.items || !Array.isArray(billData.items)) {
      throw new Error('JSON 格式錯誤：缺少必要欄位 (date, location, items)')
    }

    console.log(`✅ 成功讀取檔案: ${filePath}`)
    console.log(`   日期: ${billData.date}`)
    console.log(`   地點: ${billData.location}`)
    console.log(`   項目數量: ${billData.items.length}`)

    return billData
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON 格式錯誤: ${error.message}`)
    }
    throw error
  }
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
    console.log('')
    
    // 讀取並解析輸入檔案
    const billData = readBillFile(input)
    console.log('')
    
    // 使用核心函數計算分帳結果
    console.log(`🧮 開始計算分帳...`)
    const result = splitBill(billData)
    console.log(`✅ 計算完成！`)
    console.log(`   小計: $${result.subTotal}`)
    console.log(`   小費: $${result.tip}`)
    console.log(`   總金額: $${result.totalAmount}`)
    console.log(`   分帳人數: ${result.items.length}`)
    
    // TODO: 接下來實現檔案輸出邏輯
    
  } catch (error) {
    console.error(`❌ 錯誤: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}
