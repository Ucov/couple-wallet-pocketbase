/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateRequest((e) => {
    const status = e.record.get("status");
    const receipt = e.record.get("receipt");

    if (status !== "PENDING_AI" || !receipt) {
        return; 
    }

    const payload = {
        record: {
            id: e.record.id,
            receipt: receipt
        }
    };

    try {
        const res = $http.send({
            url: "https://n8n.unai-lab.duckdns.org/webhook/app-scanner-ticket",
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "CoupleWalletScanner2026"
            },
            timeout: 15
        });

        console.log("N8N WEBHOOK RESPONSE STATUS:", res.statusCode);
    } catch (err) {
        console.log("N8N WEBHOOK ERROR:", err);
    }
}, "expenses");
