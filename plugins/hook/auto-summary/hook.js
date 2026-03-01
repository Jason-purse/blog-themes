// auto-summary hook
// 在 Transformer Pipeline 的 late phase 运行，生成 AI 摘要

const API_KEY = process.env.MINIMAX_API_KEY || 'sk-cp-yHB2AVvGmUddHBHFC6MiDbdv6JMOhQNgmbz6mMF2jZzy1mG25J8Ns_QjL0w2yXMkHx3PN_2XqtShCNNw25W9wmQsvpQK5xdBG9blfqQQhfx611UMJ-q6AJs'
const API_HOST = 'https://api.minimax.chat/v1'

export const config = {
  phase: 'late',
  priority: 10,
  id: 'auto-summary'
}

// 提取文章正文（去掉代码块、MDX 标记）
function extractPlainText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/[#*_~\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 2000)  // 限制输入长度
}

// 生成摘要
async function generateSummary(text: string, maxLength: number = 160): Promise<string> {
  try {
    const res = await fetch(`${API_HOST}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: '你是一个博客摘要生成器。请根据文章内容生成一段简洁的摘要，不超过指定长度。直接输出摘要，不要任何前缀。' },
          { role: 'user', content: `请为以下文章生成${maxLength}字以内的摘要：\n\n${text}` }
        ]
      })
    })
    
    if (!res.ok) {
      console.error('[auto-summary] API error:', res.status)
      return ''
    }
    
    const data = await res.json()
    const summary = data.choices?.[0]?.message?.content || ''
    return summary.slice(0, maxLength)
  } catch (e) {
    console.error('[auto-summary] failed:', e)
    return ''
  }
}

// Transformer Pipeline 调用的函数
export async function transform(input: { content: string; frontmatter: Record<string, any> }) {
  // 如果 frontmatter 已有摘要，跳过
  if (input.frontmatter.summary) {
    return input
  }
  
  const plainText = extractPlainText(input.content)
  if (plainText.length < 50) {
    return input  // 内容太短不需要摘要
  }
  
  // 从 config 读取 maxLength
  const maxLength = input.frontmatter._config?.['auto-summary']?.maxLength || 160
  
  const summary = await generateSummary(plainText, maxLength)
  if (summary) {
    input.frontmatter.summary = summary
  }
  
  return input
}

// 导出为 Pipeline 格式
export default {
  id: 'auto-summary',
  phase: 'late',
  priority: 10,
  transformAsync: transform
}
