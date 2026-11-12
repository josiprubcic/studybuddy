package com.ssz.studybuddy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class StudybuddyApplicationTests {

	@Test
	void contextLoads() {
	}

}
