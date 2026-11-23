# GrandJob — System Diagrams

Tài liệu mô tả hệ thống GrandJob hiện tại: Web, Mobile, API, dữ liệu và các dịch vụ tích hợp. Các sơ đồ dùng Mermaid để có thể xem trực tiếp trên GitHub hoặc trong trình xem Markdown hỗ trợ Mermaid.

## 1. Database Diagram

Các quan hệ dưới đây được suy ra từ `ref` trong Mongoose. MongoDB không tự áp đặt foreign-key constraint như cơ sở dữ liệu quan hệ.

```mermaid
%%{init: {"theme":"neutral"}}%%
erDiagram
    USER {
        ObjectId _id PK
        string fullName
        string email UK
        string password
        string role
        date dateOfBirth
        string phone
        string avatar
        boolean isVerified
        boolean isFirstLogin
        boolean mustChangePassword
        ObjectId companyId FK
        boolean isBlocked
    }

    COMPANY {
        ObjectId _id PK
        string name
        string address
        string website
        string logo
        string scale
        string description
        array images
        boolean isVerified
        ObjectId createdBy FK
    }

    CATEGORY {
        ObjectId _id PK
        string name UK
        string slug UK
        array skills
    }

    JOB {
        ObjectId _id PK
        string title
        string slug
        ObjectId companyId FK
        ObjectId categoryId FK
        ObjectId managerId FK
        string description
        string requirements
        string benefits
        string location
        number salaryMin
        number salaryMax
        string experience
        string jobType
        string status
        string hiringStatus
        number views
        date deadline
    }

    RESUME {
        ObjectId _id PK
        ObjectId candidateId FK
        string title
        string type
        string fileUrl
        object cvData
        string templateName
        boolean isPublic
    }

    APPLICATION {
        ObjectId _id PK
        ObjectId jobId FK
        ObjectId userId FK
        ObjectId resumeId FK
        string coverLetter
        string status
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId recipientId FK
        string type
        string title
        string message
        string href
        ObjectId relatedApplicationId FK
        boolean isRead
    }

    FEEDBACK {
        ObjectId _id PK
        string companyName
        boolean isAnonymous
        string contactName
        string contactEmail
        string contactPhone
        string content
        string status
        date resolvedAt
    }

    MANAGER_ACCOUNT_REQUEST {
        ObjectId _id PK
        string fullName
        string email
        number birthYear
        string message
        string status
        date processedAt
    }

    USER ||--o{ COMPANY : "createdBy"
    COMPANY o|--o{ USER : "companyId (manager)"
    COMPANY ||--o{ JOB : "companyId"
    CATEGORY ||--o{ JOB : "categoryId"
    USER ||--o{ JOB : "managerId"
    USER ||--o{ RESUME : "candidateId"
    USER ||--o{ APPLICATION : "userId (candidate)"
    JOB ||--o{ APPLICATION : "jobId"
    RESUME ||--o{ APPLICATION : "resumeId"
    USER ||--o{ NOTIFICATION : "recipientId"
    APPLICATION ||--o{ NOTIFICATION : "relatedApplicationId"
```

**Ghi chú**

- `USER.role` phân biệt `ADMIN`, `MANAGER`, `CANDIDATE`; không có collection riêng cho từng vai trò.
- `FEEDBACK.companyName` là chuỗi, không phải tham chiếu tới `COMPANY`.
- `MANAGER_ACCOUNT_REQUEST` là yêu cầu công khai trước khi Admin cấp tài khoản, nên chưa liên kết với `USER`.
- Các model có `createdAt` và `updatedAt` do Mongoose timestamps.

## 2. Data Flow Diagram — Level 0

Sơ đồ ngữ cảnh cho thấy các tác nhân bên ngoài và dữ liệu trao đổi với hệ thống. MongoDB là kho dữ liệu nội bộ, được thể hiện trong sơ đồ kiến trúc ở phần 4.

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart LR
    C["Ứng viên / Khách"]
    M["Manager"]
    A["Admin"]
    S([0. GrandJob])
    E["Dịch vụ Email / SMTP"]

    C -->|"Đăng ký, đăng nhập, tìm việc, hồ sơ/CV, ứng tuyển, phản ánh, yêu cầu Manager"| S
    S -->|"Kết quả xác thực, tin tuyển dụng, trạng thái hồ sơ, thông báo"| C

    M -->|"Thông tin công ty, tin tuyển dụng, cập nhật hồ sơ ứng tuyển"| S
    S -->|"Trạng thái duyệt tin, danh sách ứng viên, thông báo hồ sơ mới"| M

    A -->|"Duyệt tin, quản lý tài khoản/ngành nghề, xử lý liên hệ"| S
    S -->|"Tin chờ duyệt, phản ánh, yêu cầu cấp tài khoản Manager"| A

    S -->|"OTP, thông tin cấp tài khoản"| E
    E -->|"Kết quả gửi email"| S
```

## 3. Use Case Diagram

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart LR
    G["Khách"]
    C["Ứng viên"]
    M["Manager"]
    A["Admin"]
    E["Dịch vụ Email"]

    subgraph SYSTEM["GrandJob"]
        UC1([Đăng ký / đăng nhập])
        UC2([Tìm kiếm và xem việc làm])
        UC3([Gửi phản ánh])
        UC4([Gửi yêu cầu tài khoản Manager])
        UC5([Quản lý hồ sơ cá nhân])
        UC6([Tạo và quản lý CV])
        UC7([Ứng tuyển và theo dõi hồ sơ])
        UC8([Xem thông báo])
        UC9([Quản lý công ty])
        UC10([Đăng và quản lý tin tuyển dụng])
        UC11([Xem hồ sơ ứng tuyển])
        UC12([Cập nhật trạng thái ứng tuyển])
        UC13([Quản lý tài khoản người dùng])
        UC14([Cấp tài khoản Manager])
        UC15([Duyệt hoặc từ chối tin tuyển dụng])
        UC16([Quản lý ngành nghề])
        UC17([Xử lý phản ánh])
        UC18([Xem và xử lý yêu cầu Manager])
        UC19([Gửi OTP / email tài khoản])
    end

    G --- UC1
    G --- UC2
    G --- UC3
    G --- UC4

    C --- UC5
    C --- UC6
    C --- UC7
    C --- UC8

    M --- UC2
    M --- UC8
    M --- UC9
    M --- UC10
    M --- UC11
    M --- UC12

    A --- UC13
    A --- UC14
    A --- UC15
    A --- UC16
    A --- UC17
    A --- UC18

    E --- UC19
    UC1 -. "khôi phục mật khẩu" .-> UC19
    UC14 -. "gửi thông tin đăng nhập" .-> UC19
```

## 4. Software Architectural Design

GrandJob hiện theo kiến trúc client-server dạng modular monolith: Web và REST API cùng nằm trong một ứng dụng Next.js; Mobile là ứng dụng Expo độc lập, gọi API của Web.

```mermaid
%%{init: {"theme":"neutral"}}%%
flowchart TB
    subgraph CLIENTS["Client layer"]
        WEB["Web client<br/>Next.js App Router"]
        MOBILE["Mobile client<br/>Expo Router / React Native"]
    end

    subgraph SERVER["Server layer — Next.js 16 deployment"]
        UI["Web pages and layouts"]
        API["API Route Handlers<br/>REST /api/*"]
        AUTH["Authentication and authorization<br/>JWT, role checks"]
        DOMAIN["Application logic<br/>jobs, applications, resumes,<br/>companies, feedback, notifications"]
        ODM["Mongoose models"]
        MAIL["Nodemailer"]
    end

    subgraph EXTERNAL["External services"]
        DB[("MongoDB")]
        SMTP["SMTP provider"]
    end

    WEB -->|"HTTPS"| UI
    UI -->|"Same-origin API requests"| API
    MOBILE -->|"HTTPS REST<br/>EXPO_PUBLIC_API_URL"| API
    API --> AUTH
    API --> DOMAIN
    AUTH --> ODM
    DOMAIN --> ODM
    ODM -->|"Read / write"| DB
    DOMAIN --> MAIL
    MAIL -->|"OTP and account emails"| SMTP

    WEB -. "JWT từ browser storage" .-> AUTH
    MOBILE -. "JWT từ SecureStore" .-> AUTH
```

### Thành phần và trách nhiệm

| Thành phần | Trách nhiệm |
|---|---|
| Web client | Giao diện tìm việc, hồ sơ ứng viên, quản lý tuyển dụng và trang Admin. |
| Mobile client | Ứng dụng Expo dành cho ứng viên; gọi cùng API qua `EXPO_PUBLIC_API_URL`. |
| API Route Handlers | Xử lý xác thực, kiểm tra quyền, nghiệp vụ và định dạng JSON response. |
| JWT auth | Xác minh token và vai trò người dùng cho các endpoint cần đăng nhập. |
| Mongoose models | Ánh xạ các model `User`, `Company`, `Job`, `Category`, `Resume`, `Application`, `Notification`, `Feedback`, `ManagerAccountRequest`. |
| MongoDB | Lưu dữ liệu nghiệp vụ. |
| Nodemailer / SMTP | Gửi OTP khôi phục mật khẩu và email cấp tài khoản Manager. |

### Triển khai

- Web và API được deploy cùng nhau; cấu hình production đặt tại môi trường deploy.
- Mobile được build/phát hành riêng bằng Expo/EAS và cấu hình URL API trỏ về Web backend.
- MongoDB và SMTP là dịch vụ ngoài ứng dụng.

## 5. Sequence Diagram — Ứng tuyển và xử lý hồ sơ

Luồng dưới đây mô tả ứng viên nộp CV, Manager xem hồ sơ và cập nhật trạng thái. Khi hồ sơ được chấp thuận, hệ thống tạo thông báo cho ứng viên.

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Candidate as Ứng viên
    participant Client as Web / Mobile
    participant API as Next.js API
    participant Auth as JWT và kiểm tra quyền
    participant DB as MongoDB / Mongoose
    actor Manager as Manager

    Candidate->>Client: Chọn việc làm, CV và gửi ứng tuyển
    Client->>API: POST /api/jobs/{id}/apply<br/>Bearer JWT, resumeId, coverLetter
    API->>Auth: Xác minh token và vai trò CANDIDATE
    Auth-->>API: userId và role

    alt Token không hợp lệ hoặc sai vai trò
        API-->>Client: 401 / 403
        Client-->>Candidate: Hiển thị lỗi đăng nhập hoặc quyền truy cập
    else Đúng tài khoản ứng viên
        API->>DB: Kiểm tra tài khoản, việc làm, CV thuộc ứng viên và đơn trùng
        DB-->>API: Kết quả kiểm tra
        alt Tài khoản/CV không hợp lệ, việc đã đóng hoặc đã ứng tuyển
            API-->>Client: 400 / 403 / 404 / 409
            Client-->>Candidate: Hiển thị lý do không thể ứng tuyển
        else Có thể ứng tuyển
            API->>DB: Tạo Application với trạng thái SENT
            API->>DB: Tạo thông báo APPLICATION_RECEIVED cho Manager
            alt Không tạo được thông báo
                API->>DB: Xóa Application vừa tạo
                API-->>Client: 500 — ứng tuyển thất bại
                Client-->>Candidate: Hiển thị thông báo lỗi
            else Tạo hồ sơ và thông báo thành công
                API-->>Client: 201 — ứng tuyển thành công
                Client-->>Candidate: Hiển thị xác nhận
            end
        end
    end

    Manager->>Client: Mở danh sách hồ sơ ứng tuyển
    Client->>API: GET /api/employer/applications<br/>Bearer JWT
    API->>Auth: Xác minh tài khoản MANAGER
    Auth-->>API: managerId và role
    API->>DB: Lấy việc làm của Manager và các hồ sơ liên quan
    DB-->>API: Danh sách hồ sơ
    API-->>Client: 200 — danh sách hồ sơ và CV
    Client-->>Manager: Hiển thị danh sách ứng viên

    opt Manager mở hồ sơ theo từng việc làm
        Manager->>Client: Chọn một tin tuyển dụng
        Client->>API: GET /api/jobs/{id}/apply<br/>Bearer JWT
        API->>Auth: Xác minh MANAGER và quyền sở hữu tin
        Auth-->>API: Kết quả xác thực và quyền sở hữu
        API->>DB: Lấy hồ sơ cùng thông tin ứng viên/CV
        DB-->>API: Danh sách hồ sơ của tin
        API-->>Client: 200 — danh sách ứng viên theo việc làm
        Client-->>Manager: Hiển thị hồ sơ
    end

    Manager->>Client: Chọn trạng thái hồ sơ
    Client->>API: PUT /api/employer/applications<br/>applicationId, status
    API->>Auth: Xác minh tài khoản MANAGER
    Auth-->>API: managerId và role
    API->>DB: Kiểm tra quyền sở hữu việc làm và hồ sơ
    DB-->>API: Kết quả kiểm tra
    alt Không có quyền hoặc hồ sơ không tồn tại
        API-->>Client: 403 / 404
        Client-->>Manager: Hiển thị lỗi cập nhật
    else Có quyền cập nhật
        opt Trạng thái mới là APPROVED
            API->>DB: Tạo thông báo APPLICATION_APPROVED cho ứng viên
        end
        API->>DB: Lưu trạng thái mới của Application
        alt Không lưu được trạng thái
            opt Đã tạo thông báo chấp thuận
                API->>DB: Xóa thông báo vừa tạo
            end
            API-->>Client: 500 — cập nhật thất bại
            Client-->>Manager: Hiển thị thông báo lỗi
        else Lưu thành công
            API-->>Client: 200 — trạng thái đã cập nhật
            Client-->>Manager: Hiển thị xác nhận
        end
    end
```

## 6. Sequence Diagrams cho các chức năng còn lại

Các sơ đồ dưới đây bao phủ các luồng xác thực, tìm kiếm, hồ sơ, tuyển dụng, quản trị, liên hệ và thông báo của Web và Mobile. Hai ứng dụng gọi chung các API Next.js.

### 6.1 Đăng ký, đăng nhập và đổi mật khẩu lần đầu

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Person as Người dùng
    participant Client as Web / Mobile
    participant API as Next.js API
    participant DB as MongoDB / Mongoose

    == Đăng ký ứng viên ==
    Person->>Client: Nhập họ tên, email, ngày sinh và mật khẩu
    Client->>API: POST /api/auth/register
    API->>API: Kiểm tra dữ liệu và tuổi từ đủ 18
    API->>DB: Tìm tài khoản theo email
    DB-->>API: Kết quả kiểm tra email
    alt Thiếu dữ liệu, chưa đủ 18 tuổi hoặc email đã tồn tại
        API-->>Client: 400 — từ chối đăng ký
        Client-->>Person: Hiển thị lý do
    else Dữ liệu hợp lệ
        API->>API: Hash mật khẩu bằng bcrypt
        API->>DB: Tạo USER role CANDIDATE
        DB-->>API: Tài khoản mới
        API-->>Client: 201 — đăng ký thành công
        Client-->>Person: Hiển thị xác nhận
    end

    == Đăng nhập ==
    Person->>Client: Nhập email và mật khẩu
    Client->>API: POST /api/auth/login
    API->>DB: Tìm USER theo email
    DB-->>API: Thông tin tài khoản
    alt Không tìm thấy tài khoản
        API-->>Client: 401 — thông tin đăng nhập không đúng
    else Tìm thấy tài khoản
        API->>API: So sánh mật khẩu bằng bcrypt
        alt Mật khẩu không chính xác
            API-->>Client: 401 — thông tin đăng nhập không đúng
        else Tài khoản bị khóa
            API-->>Client: 403 — tài khoản bị khóa
        else Đăng nhập hợp lệ
            API->>API: Tạo JWT hết hạn sau 1 ngày
            API-->>Client: 200 — JWT, hồ sơ và mustChangePassword
            alt Manager cần đổi mật khẩu lần đầu
                Client-->>Person: Chuyển tới trang đổi mật khẩu
                Person->>Client: Nhập mật khẩu hiện tại và mật khẩu mới
                Client->>API: PATCH /api/users/profile<br/>currentPassword, newPassword
                API->>DB: Tải USER theo userId trong JWT
                DB-->>API: Tài khoản Manager
                API->>API: Kiểm tra mật khẩu hiện tại, hash mật khẩu mới
                API->>DB: Lưu mật khẩu và xóa cờ mustChangePassword
                DB-->>API: Đã lưu
                API-->>Client: 200 — đổi mật khẩu thành công
            else Không cần đổi mật khẩu lần đầu
                Client-->>Person: Điều hướng theo vai trò tài khoản
            end
        end
    end
```

### 6.2 Quên và đặt lại mật khẩu bằng OTP

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Person as Người dùng
    participant Client as Web / Mobile
    participant API as Next.js API
    participant DB as MongoDB / Mongoose
    participant SMTP as Dịch vụ Email

    Person->>Client: Yêu cầu mã khôi phục
    Client->>API: POST /api/auth/forgot-password<br/>action=REQUEST_OTP, email
    API->>DB: Tìm USER theo email đã chuẩn hóa
    DB-->>API: Kết quả tìm kiếm
    alt Email không tồn tại
        API-->>Client: 200 — thông báo chung, không tiết lộ email tồn tại hay không
    else Tìm thấy tài khoản
        API->>API: Tạo OTP 6 số, hạn dùng 5 phút
        API->>DB: Lưu OTP và thời hạn
        API->>SMTP: Gửi OTP tới email
        alt SMTP gửi lỗi
            SMTP-->>API: Lỗi gửi thư
            API-->>Client: 500 — không gửi được OTP
        else SMTP nhận yêu cầu gửi
            SMTP-->>API: Kết quả gửi
            API-->>Client: 200 — OTP đã được gửi
        end
    end

    Person->>Client: Nhập OTP và mật khẩu mới
    Client->>API: POST /api/auth/forgot-password<br/>action=RESET_PASSWORD, email, otpCode, newPassword
    API->>DB: Tìm USER và kiểm tra OTP / thời hạn
    DB-->>API: Kết quả kiểm tra
    alt OTP sai, hết hạn hoặc thiếu dữ liệu
        API-->>Client: 400 — từ chối đặt lại mật khẩu
        Client-->>Person: Hiển thị lỗi để thử lại hoặc xin OTP mới
    else OTP hợp lệ
        API->>API: Hash mật khẩu mới bằng bcrypt
        API->>DB: Lưu mật khẩu và xóa OTP đã dùng
        DB-->>API: Đã cập nhật
        API-->>Client: 200 — đặt lại mật khẩu thành công
    end
```

### 6.3 Tìm kiếm và xem việc làm

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Visitor as Khách / Ứng viên
    participant Client as Web / Mobile
    participant API as Next.js API
    participant DB as MongoDB / Mongoose

    Visitor->>Client: Mở trang việc làm
    Client->>API: GET /api/jobs
    API->>DB: Tìm Job status=APPROVED, populate Company/Category/Manager
    DB-->>API: Danh sách việc đã duyệt
    API-->>Client: 200 — danh sách công việc

    Client->>API: GET /api/categories
    API->>DB: Lấy danh sách Category
    DB-->>API: Danh mục ngành nghề
    API-->>Client: 200 — danh sách danh mục
    Client-->>Visitor: Hiển thị việc làm và tiêu chí lọc

    Visitor->>Client: Nhập từ khóa, chọn ngành nghề và nơi làm việc
    opt Tìm kiếm trên Mobile
        Visitor->>Client: Bấm nút Tìm kiếm
    end
    Client->>Client: Lọc danh sách đã tải; không gọi API tìm kiếm riêng
    Client-->>Visitor: Hiển thị các việc phù hợp

    Visitor->>Client: Chọn một việc làm
    Client->>API: GET /api/jobs/{id}
    API->>DB: Tìm Job theo ID, populate công ty/ngành nghề/Manager
    DB-->>API: Chi tiết việc làm
    alt Không tìm thấy hoặc ID không hợp lệ
        API-->>Client: 400 / 404 — lỗi tải chi tiết
        Client-->>Visitor: Hiển thị thông báo
    else Tìm thấy
        API-->>Client: 200 — thông tin việc làm
        Client-->>Visitor: Hiển thị chi tiết và lựa chọn ứng tuyển
    end
```

### 6.4 Hồ sơ cá nhân và CV

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Candidate as Ứng viên
    participant Client as Web / Mobile
    participant API as Next.js API
    participant Auth as Xác minh JWT
    participant DB as MongoDB / Mongoose

    Candidate->>Client: Mở trang hồ sơ
    Client->>API: GET /api/users/profile<br/>Bearer JWT
    API->>Auth: Xác minh token và lấy userId
    Auth-->>API: Danh tính tài khoản
    API->>DB: Đọc USER và loại password/OTP khỏi kết quả
    DB-->>API: Hồ sơ cá nhân
    API-->>Client: 200 — hồ sơ

    Candidate->>Client: Cập nhật họ tên, ngày sinh, avatar hoặc điện thoại
    Client->>API: PUT /api/users/profile<br/>Bearer JWT, các trường thay đổi
    API->>Auth: Xác minh token
    Auth-->>API: userId
    API->>DB: Cập nhật USER theo userId
    DB-->>API: Hồ sơ đã cập nhật
    API-->>Client: 200 — hồ sơ mới

    Candidate->>Client: Mở danh sách CV
    Client->>API: GET /api/resume<br/>Bearer JWT hoặc x-candidate-id
    API->>Auth: Lấy candidateId từ token hoặc header
    Auth-->>API: candidateId
    API->>DB: Tìm Resume theo candidateId
    DB-->>API: Danh sách CV
    API-->>Client: 200 — danh sách CV

    Candidate->>Client: Lưu CV trực tuyến hoặc CV tải lên
    Client->>API: POST /api/resume/save<br/>Bearer JWT hoặc x-candidate-id, dữ liệu CV
    API->>Auth: Lấy candidateId từ token hoặc header
    Auth-->>API: candidateId
    API->>DB: Xác minh USER tồn tại và role CANDIDATE
    DB-->>API: Ứng viên hợp lệ
    API->>DB: Upsert Resume theo candidateId + title
    DB-->>API: CV mới hoặc CV đã cập nhật
    API-->>Client: 200 — CV đã lưu
```

### 6.5 Quản lý công ty và tin tuyển dụng của Manager

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Manager
    participant Client as Web
    participant API as Next.js API
    participant Auth as JWT / kiểm tra vai trò
    participant DB as MongoDB / Mongoose

    Manager->>Client: Tạo công ty
    Client->>API: POST /api/companies<br/>Bearer JWT, thông tin công ty
    API->>Auth: Xác minh MANAGER, tài khoản không bị khóa
    Auth-->>API: managerId
    API->>DB: Đếm công ty đã tạo
    DB-->>API: Số lượng công ty
    alt Đã đạt giới hạn 2 công ty hoặc thiếu dữ liệu bắt buộc
        API-->>Client: 400 — không tạo được công ty
    else Đủ điều kiện
        API->>DB: Tạo Company isVerified=false
        API->>DB: Gán companyId mới cho USER
        DB-->>API: Công ty đã tạo
        API-->>Client: 201 — công ty mới
    end

    Manager->>Client: Mở danh sách công ty của mình
    Client->>API: GET /api/companies/my-company<br/>Bearer JWT
    API->>Auth: Xác minh token
    Auth-->>API: userId
    API->>DB: Tìm Company theo createdBy
    DB-->>API: Danh sách công ty
    API-->>Client: 200 — danh sách công ty

    Manager->>Client: Mở dashboard việc làm và số hồ sơ
    Client->>API: GET /api/companies/my-company/jobs<br/>Bearer JWT
    API->>Auth: Xác minh MANAGER và trạng thái tài khoản
    Auth-->>API: managerId
    API->>DB: Lấy công ty, việc làm và số Application theo từng việc
    DB-->>API: Dữ liệu nhóm theo công ty
    API-->>Client: 200 — việc làm và số hồ sơ

    opt Sửa hoặc xóa công ty
        Manager->>Client: Cập nhật hoặc xóa công ty
        Client->>API: PATCH hoặc DELETE /api/companies/my-company?id={id}
        API->>Auth: Xác minh Bearer JWT
        Auth-->>API: userId
        API->>DB: Chỉ cập nhật/xóa Company có createdBy=userId
        DB-->>API: Kết quả thao tác
        API-->>Client: 200 hoặc 404
    end

    Manager->>Client: Tạo tin tuyển dụng
    Client->>API: POST /api/jobs/create<br/>Bearer JWT hoặc x-manager-id
    API->>Auth: Xác minh MANAGER
    Auth-->>API: managerId
    API->>DB: Tạo Job với status=PENDING
    DB-->>API: Tin chờ Admin duyệt
    API-->>Client: 201 — tin đã gửi duyệt

    opt Đóng hoặc mở nhận hồ sơ
        Manager->>Client: Đổi hiringStatus
        Client->>API: PATCH /api/jobs/{id}/hiring-status
        API->>Auth: Xác minh MANAGER và quyền sở hữu công ty/tin
        Auth-->>API: Quyền hợp lệ
        API->>DB: Cập nhật hiringStatus OPEN hoặc CLOSED
        DB-->>API: Tin đã cập nhật
        API-->>Client: 200 — trạng thái tuyển dụng mới
    end

    opt Sửa hoặc xóa tin theo ID
        Manager->>Client: Sửa hoặc xóa tin
        Client->>API: PUT hoặc DELETE /api/jobs/{id}
        API->>DB: Cập nhật hoặc xóa Job theo ID
        DB-->>API: Kết quả thao tác
        API-->>Client: 200 hoặc 404
    end
```

**Lưu ý hiện trạng:** route `PUT`/`DELETE /api/jobs/{id}` hiện thao tác theo ID nhưng không tự xác minh JWT hoặc quyền sở hữu Manager; sơ đồ không thể hiện bước kiểm tra quyền cho hai thao tác này. Tạo tin và đổi trạng thái tuyển dụng có kiểm tra Manager riêng.

### 6.6 Chức năng quản trị: tài khoản, ngành nghề và duyệt tin

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Admin
    participant Client as Admin Dashboard
    participant API as Next.js API
    participant Auth as Xác minh quyền Admin
    participant DB as MongoDB / Mongoose

    Admin->>Client: Mở trang quản lý người dùng
    Client->>API: GET /api/admin/users<br/>Bearer JWT
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Lấy người dùng, thống kê vai trò và trạng thái
    DB-->>API: Danh sách và số liệu
    API-->>Client: 200 — người dùng và thống kê

    Admin->>Client: Khóa hoặc mở khóa tài khoản
    Client->>API: PATCH /api/admin/users<br/>targetUserId, action
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Kiểm tra tài khoản đích và quy tắc không tự khóa/Admin
    DB-->>API: Tài khoản hợp lệ
    API->>DB: Cập nhật isBlocked và status
    DB-->>API: Tài khoản đã cập nhật
    API-->>Client: 200 — trạng thái tài khoản mới

    Admin->>Client: Xem tin chờ duyệt
    Client->>API: GET /api/admin/approve-job
    API->>DB: Tìm Job status=PENDING
    DB-->>API: Danh sách tin chờ duyệt
    API-->>Client: Danh sách tin

    Admin->>Client: Duyệt, từ chối hoặc đánh dấu hết hạn
    Client->>API: PUT /api/admin/approve-job<br/>jobId, status
    API->>Auth: Xác minh JWT role ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Cập nhật Job status
    DB-->>API: Tin đã cập nhật
    API-->>Client: 200 — kết quả duyệt tin

    Admin->>Client: Mở danh mục ngành nghề
    Client->>API: GET /api/categories
    API->>DB: Lấy danh sách Category
    DB-->>API: Danh sách danh mục
    API-->>Client: 200 — danh mục

    Admin->>Client: Tạo danh mục ngành nghề
    Client->>API: POST /api/categories<br/>Bearer JWT, name, skills
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Kiểm tra name/slug trùng
    DB-->>API: Kết quả kiểm tra
    alt Tên hoặc slug đã tồn tại
        API-->>Client: 400 — danh mục trùng
    else Chưa tồn tại
        API->>DB: Tạo Category và slug
        DB-->>API: Danh mục mới
        API-->>Client: 201 — tạo thành công
    end
```

**Lưu ý hiện trạng:** `GET /api/admin/approve-job` hiện truy vấn tin PENDING mà không kiểm tra quyền Admin ở route; thao tác `PUT` có kiểm tra JWT role ADMIN.

### 6.7 Phản ánh, yêu cầu tài khoản Manager và cấp tài khoản

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Visitor as Khách / Người dùng
    actor Admin
    participant Client as Web
    participant API as Next.js API
    participant Auth as Xác minh quyền Admin
    participant DB as MongoDB / Mongoose
    participant SMTP as Dịch vụ Email

    Visitor->>Client: Mở biểu mẫu liên hệ
    Client->>API: GET /api/companies
    API->>DB: Lấy danh sách công ty
    DB-->>API: Danh sách công ty
    API-->>Client: 200 — danh sách cho biểu mẫu

    alt Gửi phản ánh
        Visitor->>Client: Nhập nội dung và thông tin liên hệ hoặc chọn ẩn danh
        Client->>API: POST /api/feedback
        API->>API: Kiểm tra nội dung và thông tin liên hệ
        API->>DB: Tạo Feedback status=NEW
        DB-->>API: Phản ánh mới
        API-->>Client: 201 — đã nhận phản ánh
    else Xin tài khoản Manager
        Visitor->>Client: Nhập họ tên, email, năm sinh
        Client->>API: POST /api/manager-account-requests
        API->>API: Kiểm tra dữ liệu và đủ 18 tuổi
        API->>DB: Kiểm tra yêu cầu đang mở theo email
        DB-->>API: Kết quả kiểm tra
        alt Yêu cầu trùng hoặc thông tin không hợp lệ
            API-->>Client: 400 / 409 — không nhận yêu cầu
        else Hợp lệ
            API->>DB: Tạo ManagerAccountRequest status=NEW
            DB-->>API: Yêu cầu mới
            API-->>Client: 201 — đã nhận yêu cầu
        end
    end

    Admin->>Client: Mở trang xử lý liên hệ
    Client->>API: GET /api/feedback<br/>Bearer JWT
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Xóa Feedback RESOLVED quá 5 ngày và lấy danh sách còn hạn
    DB-->>API: Danh sách phản ánh
    API-->>Client: 200 — danh sách phản ánh

    Client->>API: GET /api/manager-account-requests<br/>Bearer JWT
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Xóa yêu cầu RESOLVED quá 5 ngày và lấy danh sách còn hạn
    DB-->>API: Danh sách yêu cầu Manager
    API-->>Client: 200 — danh sách yêu cầu

    Admin->>Client: Cập nhật trạng thái phản ánh
    Client->>API: PATCH /api/feedback<br/>feedbackId, status
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Lưu status; đặt hoặc xóa resolvedAt
    DB-->>API: Feedback đã cập nhật
    API-->>Client: 200 — trạng thái mới

    Admin->>Client: Cập nhật trạng thái yêu cầu Manager
    Client->>API: PATCH /api/manager-account-requests<br/>requestId, status
    API->>Auth: Xác minh ADMIN
    Auth-->>API: Admin hợp lệ
    API->>DB: Lưu status; đặt hoặc xóa processedAt
    DB-->>API: Yêu cầu đã cập nhật
    API-->>Client: 200 — trạng thái mới

    opt Admin quyết định cấp tài khoản Manager
        Note over Admin,API: Đây là thao tác riêng; yêu cầu không tự tạo tài khoản
        Admin->>Client: Nhập thông tin để cấp tài khoản
        Client->>API: POST /api/admin/create-manager<br/>Bearer JWT, email, họ tên, ngày sinh
        API->>Auth: Xác minh ADMIN
        Auth-->>API: Admin hợp lệ
        API->>API: Kiểm tra đủ 18 tuổi, email chưa dùng, tạo mật khẩu tạm
        API->>DB: Tạo USER role MANAGER, mustChangePassword=true
        DB-->>API: Manager mới đã được lưu
        API->>SMTP: Gửi email tài khoản và mật khẩu tạm
        alt Gửi email thất bại
            SMTP-->>API: Lỗi SMTP
            API-->>Client: 502 — tài khoản vẫn đã tạo, emailSent=false
        else Email được gửi
            SMTP-->>API: Đã nhận yêu cầu gửi
            API-->>Client: 201 — tài khoản đã tạo, emailSent=true
        end
    end
```

### 6.8 Xem và đánh dấu đã đọc thông báo

```mermaid
%%{init: {"theme":"neutral"}}%%
sequenceDiagram
    actor Recipient as Ứng viên / Manager
    participant Client as Web / Mobile
    participant API as Next.js API
    participant Auth as Xác minh người dùng
    participant DB as MongoDB / Mongoose

    Recipient->>Client: Mở hộp thư thông báo
    Client->>API: GET /api/notifications<br/>Bearer JWT
    API->>Auth: Xác minh userId và tài khoản không bị khóa
    Auth-->>API: Người nhận hợp lệ
    API->>DB: Lấy tối đa 20 thông báo của recipientId, mới nhất trước
    DB-->>API: Danh sách thông báo
    API-->>Client: 200 — thông báo
    Client-->>Recipient: Hiển thị danh sách

    Recipient->>Client: Đánh dấu một thông báo đã đọc
    Client->>API: PATCH /api/notifications<br/>notificationId, Bearer JWT
    API->>Auth: Xác minh người nhận
    Auth-->>API: recipientId
    API->>DB: Cập nhật isRead chỉ khi notification thuộc recipientId
    DB-->>API: Kết quả cập nhật
    alt Không tìm thấy thông báo của người nhận
        API-->>Client: 404 — không tìm thấy thông báo
    else Đã đánh dấu
        API-->>Client: 200 — cập nhật thành công
        Client-->>Recipient: Cập nhật trạng thái đã đọc
    end
```

### Đối chiếu phạm vi API

| Nhóm chức năng | API được bao phủ |
|---|---|
| Tài khoản | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/forgot-password`, `GET/PUT/PATCH /api/users/profile` |
| Tìm việc | `GET /api/jobs`, `GET /api/jobs/{id}`, `GET /api/categories`, `GET /api/companies` |
| Hồ sơ/CV | `GET /api/resume`, `POST /api/resume/save` |
| Công ty/việc làm Manager | `POST /api/companies`, `GET/PATCH/DELETE /api/companies/my-company`, `GET /api/companies/my-company/jobs`, `POST /api/jobs/create`, `GET/PUT/DELETE /api/jobs/{id}`, `PATCH /api/jobs/{id}/hiring-status` |
| Ứng tuyển | `POST/GET /api/jobs/{id}/apply`, `GET/PUT /api/employer/applications` |
| Quản trị | `GET/PATCH /api/admin/users`, `GET/PUT /api/admin/approve-job`, `POST /api/admin/create-manager`, `GET/POST /api/categories` |
| Liên hệ | `POST/GET/PATCH /api/feedback`, `POST/GET/PATCH /api/manager-account-requests` |
| Thông báo | `GET/PATCH /api/notifications` |
