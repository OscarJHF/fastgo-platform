package com.fastgo.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EmailServiceTest {

    @Test
    void testEmailServiceInstantiation() {
        EmailService service = new EmailService();
        assertNotNull(service);
    }
}
