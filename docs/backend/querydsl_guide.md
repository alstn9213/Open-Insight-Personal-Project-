# 📘 QueryDSL 도입 및 사용 가이드

##  개요

**QueryDSL**은 하이버네이트(Hibernate)나 JPA의 쿼리(JPQL)를 자바 코드(Code)로 작성할 수 있게 도와주는 프레임워크입니다.

기존의 **Spring Data JPA(`@Query`)** 방식은 정적인 쿼리 처리에는 매우 효율적이지만, 다음과 같은 한계가 있었습니다.

1.  **타입 안정성 부족:** 쿼리가 문자열(`String`)로 작성되므로, 오타(예: 필드명 불일치)가 있어도 **서버를 실행하고 해당 로직을 호출하기 전까지는 에러를 발견할 수 없습니다 (Runtime Error).**
2.  **동적 쿼리의 복잡성:** "지역별", "매출별", "업종별" 필터링처럼 사용자의 선택에 따라 조건이 바뀌는 경우, 문자열을 `if`문으로 이어 붙여야 하는 등 코드 가독성과 유지보수성이 급격히 떨어집니다.

**QueryDSL**을 도입하면 쿼리를 자바 코드로 작성하므로 **컴파일 시점에 문법 오류를 잡을 수 있고**, 메서드 체이닝을 통해 **동적 쿼리를 직관적으로 구현**할 수 있습니다.

-----

## 환경 설정

**프로젝트 환경:** Java 17, Spring Boot 3.5.8, Gradle

Spring Boot 3.x 버전부터는 `javax` 대신 `jakarta` 패키지를 사용해야 하므로 설정에 주의해야 합니다.

### `build.gradle` 설정

```groovy
dependencies {
    // ... 기존 의존성 ...

    // QueryDSL (Spring Boot 3.x / Jakarta 호환 버전)
    implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
    annotationProcessor "com.querydsl:querydsl-apt:5.0.0:jakarta"
    annotationProcessor "jakarta.annotation:jakarta.annotation-api"
    annotationProcessor "jakarta.persistence:jakarta.persistence-api"
}

// Q-Class 생성 경로 설정
def querydslDir = "$buildDir/generated/querydsl"

sourceSets {
    main.java.srcDirs += [ querydslDir ]
}

tasks.withType(JavaCompile) {
    options.getGeneratedSourceOutputDirectory().set(file(querydslDir))
}

clean.doLast {
    file(querydslDir).deleteDir()
}
```

> **참고:** 설정을 마친 후에는 반드시 Intellij 기준 오른쪽에 있는 `Gradle` 탭에서 `clean` 실행 후 `compileJava`를 실행하여 `QClass` 파일(예: `QMarketStats.java`)을 생성해야 합니다.

-----

## 구현 패턴 (Implementation Pattern)

QueryDSL을 기존 JPA와 함께 사용하기 위해 **Custom Repository 패턴**을 사용합니다.

### 패키지 및 파일 구조

`src/main/java/com/back/repository/` 내에 아래와 같이 구성합니다.

```text
repository/
├── MarketStatsRepository.java        (기존 JpaRepository 인터페이스)
├── MarketStatsRepositoryCustom.java  (Step 1: 사용자 정의 인터페이스)
└── MarketStatsRepositoryImpl.java    (Step 2: QueryDSL 구현 클래스)
```

### 구현 단계

#### Step 1: 인터페이스 정의 (`~Custom`)

구현하고자 하는 동적 검색 메서드의 명세를 정의합니다.

```java
public interface MarketStatsRepositoryCustom {
    List<MarketStats> searchMarket(String province, Long categoryId, Long minSales);
}
```

#### Step 2: QueryDSL 로직 구현 (`~Impl`)

실제 자바 코드로 쿼리를 작성하는 곳입니다. 클래스 이름 끝에 반드시 `Impl`을 붙여야 Spring이 인식합니다.

```java
@Repository
@RequiredArgsConstructor
public class MarketStatsRepositoryImpl implements MarketStatsRepositoryCustom {

    private final JPAQueryFactory queryFactory;
-
    @Override
    public List<MarketStats> searchMarket(String province, Long categoryId, Long minSales) {
        return queryFactory
                .selectFrom(marketStats) // static import된 Q클래스 사용
                .join(marketStats.region).fetchJoin()   // 성능 최적화 (N+1 방지)
                .join(marketStats.category).fetchJoin()
                .where(
                        eqProvince(province),   // 동적 조건 메서드 호출
                        eqCategory(categoryId),
                        goeSales(minSales)
                )
                .orderBy(marketStats.netGrowthRate.desc())
                .fetch();
    }

    // 조건이 null이면 무시하는 동적 쿼리 헬퍼 메서드 (BooleanExpression)
    private BooleanExpression eqProvince(String province) {
        return province != null ? marketStats.region.province.eq(province) : null;
    }
    
    private BooleanExpression eqCategory(Long categoryId) {
        return categoryId != null ? marketStats.category.id.eq(categoryId) : null;
    }

    private BooleanExpression goeSales(Long minSales) {
        return minSales != null ? marketStats.averageSales.goe(minSales) : null;
    }
}
```

#### Step 3: 메인 리포지토리에 상속 (`Repository`)

기존 `JpaRepository`에 커스텀 인터페이스를 상속시킵니다.

```java
public interface MarketStatsRepository extends JpaRepository<MarketStats, Long>, MarketStatsRepositoryCustom {
    // 기존 JPQL 메서드들과 QueryDSL 메서드를 모두 사용할 수 있음
}
```

-----

## 활용 전략

| 구분 | 기술 스택 | 사용 기준 | 예시 |
| :--- | :--- | :--- | :--- |
| **단순 조회** | **Spring Data JPA** <br> (`@Query`, 메서드 명명법) | 조건이 고정되어 있거나 단순한 CRUD | `findById`, `findByAdmCode` |
| **복잡한 검색** | **QueryDSL** | 사용자 입력에 따라 `WHERE` 절이 변하는 동적 쿼리, 복잡한 통계 | `searchMarket`, `getRankings` |

![alt text](image.png)