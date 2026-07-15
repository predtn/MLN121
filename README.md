# Hành Trình Lịch Sử

Landing page timeline lịch sử kèm MVP **Đối thoại cùng nhân vật** bằng OpenAI Responses API.

## Chạy dự án

Yêu cầu Node.js 18 trở lên.

1. Sao chép `.env.example` thành `.env`.
2. Điền `OPENAI_API_KEY` trong `.env`.
3. Chạy:

```powershell
npm start
```

4. Mở `http://127.0.0.1:3000`.

Mặc định ứng dụng dùng `gpt-5-mini`, mức suy luận thấp và tối đa 3.000 token đầu ra để tránh phản hồi bị cắt giữa chừng.

Không mở trực tiếp `index.html` bằng `file://`, vì tính năng chat cần endpoint `/api/chat` từ server.

## Cấu trúc MVP

- `server.js`: phục vụ landing page, giữ API key và gọi OpenAI.
- `api/chat.js`: Vercel Function cho endpoint chat khi deploy.
- `vercel.json`: thời gian chạy function, CSP và security headers.
- `app.js`: giao diện và trạng thái chat theo từng nhân vật.
- `.env`: cấu hình bí mật, đã được loại khỏi Git.

Nội dung hội thoại là mô phỏng giáo dục bằng AI, không phải phát ngôn thật của nhân vật lịch sử.

## Deploy lên Vercel

1. Đẩy dự án lên một Git repository. Không commit file `.env`.
2. Trong Vercel chọn **Add New → Project**, import repository và giữ Framework Preset là **Other**.
3. Không cần Build Command hay Output Directory.
4. Trong **Settings → Environment Variables**, mặc định chỉ thêm cho **Production**:

```text
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-5-mini
OPENAI_MAX_OUTPUT_TOKENS=3000
```

5. Deploy hoặc redeploy dự án. `PORT` và `HOST` chỉ dùng local, không thêm lên Vercel.

### Checklist bảo mật sau deploy

- Vào **Firewall → Configure → New Rule**.
- Điều kiện: request path bằng `/api/chat`.
- Action: **Rate Limit**, Fixed Window `60s`, tối đa `10` request theo IP, trả `429`.
- Trong OpenAI Project đặt monthly budget/usage limit phù hợp và giữ Auto Recharge tắt nếu chỉ chạy demo.
- Không đặt tên API key với tiền tố `NEXT_PUBLIC_`, không đưa key vào `app.js`, Git hoặc ảnh chụp màn hình.
- Chỉ cấp key cho Preview khi thật sự cần và đã bật **Vercel Authentication** cho Preview Deployments.
- Nếu key từng bị commit hay chia sẻ, thu hồi key cũ và tạo key mới trước khi deploy.

Rate limit trong code chỉ là lớp bảo vệ phụ vì mỗi Vercel Function instance có bộ nhớ riêng; Firewall là lớp giới hạn chính cho endpoint công khai.
