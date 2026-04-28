package com.tourpro.config;

import com.tourpro.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Wrapper của User entity để Spring Security dùng trong filter chain.
 * Expose getId() để @PreAuthorize có thể so sánh với path variable.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long   id;
    private final String username;
    private final String password;
    private final String fullName;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserPrincipal(User user) {
        this.id          = user.getId();
        this.username    = user.getUsername();
        this.password    = user.getPasswordHash();
        this.fullName    = user.getFullName();
        this.active      = user.getStatus() == User.UserStatus.ACTIVE;
        // Spring Security expects "ROLE_" prefix
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    // ── UserDetails contract ──────────────────────────────
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public String getPassword()                                     { return password; }
    @Override public String getUsername()                                     { return username; }
    @Override public boolean isAccountNonExpired()                            { return true; }
    @Override public boolean isAccountNonLocked()                             { return active; }
    @Override public boolean isCredentialsNonExpired()                        { return true; }
    @Override public boolean isEnabled()                                      { return active; }
}