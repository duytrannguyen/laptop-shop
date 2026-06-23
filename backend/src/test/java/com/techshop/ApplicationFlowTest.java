package com.techshop;

import com.fasterxml.jackson.databind.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:techshop-test;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.upload-dir=./target/test-uploads",
        "app.token.secret=test-secret"
})
@AutoConfigureMockMvc
class ApplicationFlowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    @Test
    void adminApiRequiresTokenAndLoginProvidesAccess() throws Exception {
        mvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());

        String token = login();
        mvc.perform(get("/api/admin/stats").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalProducts").value(3))
                .andExpect(jsonPath("$.totalBanners").value(3));
    }

    @Test
    void orderCanBeCreatedTrackedAndCancelledWithStockRestored() throws Exception {
        JsonNode products = json.readTree(mvc.perform(get("/api/products"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        long productId = products.get(0).get("id").asLong();
        int initialStock = products.get(0).get("stock").asInt();

        String body = """
                {
                  "customerName": "Khach kiem thu",
                  "phone": "0901234567",
                  "address": "Can Tho",
                  "note": "",
                  "items": [{"productId": %d, "quantity": 1}]
                }
                """.formatted(productId);

        JsonNode order = json.readTree(mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString());

        mvc.perform(get("/api/orders/track").param("phone", "0901234567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(order.get("id").asLong()));

        JsonNode afterOrder = json.readTree(mvc.perform(get("/api/products"))
                .andReturn().getResponse().getContentAsString());
        int reducedStock = findStock(afterOrder, productId);
        assertThat(reducedStock).isEqualTo(initialStock - 1);

        String token = login();
        mvc.perform(put("/api/admin/orders/{id}/status", order.get("id").asLong())
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELLED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        JsonNode afterCancel = json.readTree(mvc.perform(get("/api/products"))
                .andReturn().getResponse().getContentAsString());
        assertThat(findStock(afterCancel, productId)).isEqualTo(initialStock);
    }

    private String login() throws Exception {
        String response = mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@techshop.vn\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("token").asText();
    }

    private int findStock(JsonNode products, long productId) {
        for (JsonNode product : products) {
            if (product.get("id").asLong() == productId) return product.get("stock").asInt();
        }
        throw new AssertionError("Product not found: " + productId);
    }
}
