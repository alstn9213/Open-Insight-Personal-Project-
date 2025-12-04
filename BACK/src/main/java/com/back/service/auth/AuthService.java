package com.back.service.auth;

import com.back.domain.member.Member;
import com.back.dto.request.LoginRequest;
import com.back.dto.request.SignupRequest;
import com.back.dto.response.TokenResponse;
import com.back.global.jwt.JwtTokenProvider;
import com.back.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public Long signup(SignupRequest request) {
        if(memberRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("이미 가입된 이메일 입니다.");
        }
        Member member = memberRepository.save(request.toEntity(passwordEncoder));
        return member.getId();
    }

    public TokenResponse login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

        if(!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        String accessToken = jwtTokenProvider.createToken(member.getEmail(), member.getRole());

        return TokenResponse.from(accessToken);
    }
}
