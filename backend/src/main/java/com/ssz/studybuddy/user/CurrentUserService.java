package com.ssz.studybuddy.user;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The one place that knows who is calling. Every query for user data filters by {@link #currentUserId()}.
 */
@Service
public class CurrentUserService {

    // shortcut: everyone is one development user until Auth0 is set up; then read the JWT "sub" claim here
    static final String DEV_AUTH0_ID = "dev-user";

    private final UserRepository users;

    public CurrentUserService(UserRepository users) {
        this.users = users;
    }

    @Transactional
    public Long currentUserId() {
        return users.findByAuth0Id(DEV_AUTH0_ID)
                .orElseGet(() -> users.save(new User(DEV_AUTH0_ID)))
                .getId();
    }
}
