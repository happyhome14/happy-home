// ==========================================
// KẾT NỐI SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://idcsmnlhjnupvrpenlxx.supabase.co";

// Dùng đúng Publishable Key mà Dương đang sử dụng
// trong booking.js
const SUPABASE_KEY = "sb_publishable_7ZMfIIrFX8AwjlHVQLPCyg_n7QHZ1HX";
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================
// HÀM ĐỊNH DẠNG TIỀN
// ==========================================

function formatMoney(number) {

    return new Intl.NumberFormat("vi-VN")
        .format(Number(number || 0)) + "đ";

}


// ==========================================
// HÀM ĐỊNH DẠNG NGÀY GIỜ
// ==========================================

function formatDateTime(dateString) {

    if (!dateString) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "vi-VN",
        {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(new Date(dateString));

}


// ==========================================
// HÀM TRA CỨU ĐẶT PHÒNG
// ==========================================

async function lookupBooking() {

    const bookingCodeInput =
        document.getElementById("bookingCode");

const searchValue =
    bookingCodeInput.value.trim();

    // ------------------------------
    // Kiểm tra người dùng đã nhập mã
    // ------------------------------

   if (!searchValue) {

    alert("Vui lòng nhập mã đặt phòng hoặc số điện thoại.");

    bookingCodeInput.focus();

    return;
}

    // ------------------------------
    // Ẩn kết quả cũ
    // ------------------------------

    document.getElementById(
        "lookupResult"
    ).style.display = "none";

    const multipleResult =
    document.getElementById("lookupMultipleResult");

if (multipleResult) {
    multipleResult.style.display = "none";
}

    document.getElementById(
        "lookupError"
    ).style.display = "none";


    try {

        // ------------------------------
        // Tìm booking theo mã
        // ------------------------------

        let data;
let error;

// Nếu người dùng nhập số điện thoại
if (/^\d+$/.test(searchValue)) {

    const result = await supabaseClient
        .from("bookings")
        .select("*")
        .eq("customer_phone", searchValue)
        .order("created_at", {
            ascending: false
        });

    data = result.data;
    error = result.error;

} else {

    // Nếu không phải số → tìm theo mã đặt phòng
    const result = await supabaseClient
        .from("bookings")
        .select("*")
        .eq("booking_code", searchValue)
        .maybeSingle();

    data = result.data;
    error = result.error;
}

        // ------------------------------
        // Kiểm tra lỗi Supabase
        // ------------------------------

        if (error) {

            console.error(
                "Lỗi tra cứu:",
                error
            );

            alert(
                "Có lỗi xảy ra khi tra cứu. Vui lòng thử lại."
            );

            return;
        }


        // ------------------------------
// Không tìm thấy booking
// ------------------------------

if (
    !data ||
    (Array.isArray(data) && data.length === 0)
) {

    document.getElementById(
        "lookupError"
    ).style.display = "block";

    return;
}


// ======================================
// TRA CỨU BẰNG SỐ ĐIỆN THOẠI
// CÓ NHIỀU ĐƠN
// ======================================

if (Array.isArray(data)) {

    // Nếu chỉ có 1 đơn
    // thì dùng giao diện kết quả cũ

    if (data.length === 1) {

        data = data[0];

    } else {

        const multipleResult =
            document.getElementById(
                "lookupMultipleResult"
            );

        const bookingList =
            document.getElementById(
                "lookupBookingList"
            );

        if (multipleResult && bookingList) {

            bookingList.innerHTML = "";

            data.forEach(function (booking) {

                const item =
                    document.createElement("div");

                item.className =
                    "lookup-booking-item";

                item.innerHTML = `
                    <div class="lookup-booking-item-header">
                        <strong>
                            Mã đặt phòng:
                            ${booking.booking_code || ""}
                        </strong>

                        <span>
                            ${booking.status || "Chờ xác nhận"}
                        </span>
                    </div>

                    <div class="lookup-booking-item-grid">

                        <div>
                            <span>Khách hàng</span>
                            <strong>
                                ${booking.customer_name || ""}
                            </strong>
                        </div>

                        <div>
                            <span>Số điện thoại</span>
                            <strong>
                                ${booking.customer_phone || ""}
                            </strong>
                        </div>

                        <div>
                            <span>Phòng</span>
                            <strong>
                                ${(booking.room_type || "") +
                                " - " +
                                (booking.room_number || "")}
                            </strong>
                        </div>

                        <div>
                            <span>Số khách</span>
                            <strong>
                                ${(booking.guest_number || 0) +
                                " khách"}
                            </strong>
                        </div>

                        <div>
                            <span>Nhận phòng</span>
                            <strong>
                                ${formatDateTime(
                                    booking.check_in
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Trả phòng</span>
                            <strong>
                                ${formatDateTime(
                                    booking.check_out
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>Tổng tiền dự kiến</span>
                            <strong>
                                ${formatMoney(
                                    booking.total_price
                                )}
                            </strong>
                        </div>

                    </div>
                `;

                bookingList.appendChild(item);

            });


            multipleResult.style.display =
                "block";


            multipleResult.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            return;
        }
    }
}

        // ======================================
        // HIỂN THỊ THÔNG TIN BOOKING
        // ======================================

        document.getElementById(
            "lookupBookingCode"
        ).textContent =
            data.booking_code || "";


        document.getElementById(
            "lookupCustomerName"
        ).textContent =
            data.customer_name || "";


        document.getElementById(
            "lookupCustomerPhone"
        ).textContent =
            data.customer_phone || "";


        document.getElementById(
            "lookupRoom"
        ).textContent =
            (data.room_type || "") +
            " - " +
            (data.room_number || "");


        document.getElementById(
            "lookupGuestNumber"
        ).textContent =
            (data.guest_number || 0) +
            " khách";


        document.getElementById(
            "lookupCheckIn"
        ).textContent =
            formatDateTime(data.check_in);


        document.getElementById(
            "lookupCheckOut"
        ).textContent =
            formatDateTime(data.check_out);


        document.getElementById(
            "lookupTotalPrice"
        ).textContent =
            formatMoney(data.total_price);


        document.getElementById(
            "lookupStatus"
        ).textContent =
            data.status || "Chờ xác nhận";


        // ------------------------------
        // Hiện kết quả
        // ------------------------------

        document.getElementById(
            "lookupResult"
        ).style.display = "block";


        // Cuộn tới kết quả

        document.getElementById(
            "lookupResult"
        ).scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    catch (error) {

        console.error(
            "Lỗi:",
            error
        );

        alert(
            "Không thể kết nối tới hệ thống. Vui lòng thử lại."
        );
    }

}