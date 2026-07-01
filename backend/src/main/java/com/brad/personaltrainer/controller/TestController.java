package com.brad.personaltrainer.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test/private")
    public String privateEndpoint() {
        return "You are authenticated";
    }
}
